'use client';

import Image from 'next/image';
import { useState } from 'react';
import { digitsOnly, isValidBrCpfCnpjLength } from '@/lib/br-tax-id';
import { looksLikeLegacyMockClientResponse } from '@/lib/payments/payment-invariants';
import PaymentStatusBadge from '@/components/PaymentStatusBadge';
import {
  PRODUCTION_LIMITATION_MESSAGES,
  type ProductionLimitationKey,
} from '@/lib/payments/payment-ui';

interface PaymentFormProps {
  orderId: string;
  /** CPF/CNPJ já salvo no cadastro (só dígitos no banco) */
  initialPayerDocument?: string;
}

export default function PaymentForm({ orderId, initialPayerDocument = '' }: PaymentFormProps) {
  const [payerDoc, setPayerDoc] = useState(initialPayerDocument);
  const [loading, setLoading] = useState<'pix' | 'crypto' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitationKey, setLimitationKey] = useState<ProductionLimitationKey | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [result, setResult] = useState<{
    paymentId: string;
    qrCode?: string;
    qrCodeBase64?: string;
    redirectUrl?: string;
    method: 'pix' | 'crypto';
  } | null>(null);

  function inferLimitationKey(value: unknown): ProductionLimitationKey | null {
    if (typeof value !== 'string' || value.length === 0) {
      return null;
    }

    const normalized = value.toLowerCase();
    if (
      normalized.includes('timeout') ||
      normalized.includes('demor') ||
      normalized.includes('tempo')
    ) {
      return 'timeout';
    }
    if (
      normalized.includes('cold') ||
      normalized.includes('acord') ||
      normalized.includes('inici')
    ) {
      return 'cold_start';
    }
    if (
      normalized.includes('gateway') ||
      normalized.includes('inst')
    ) {
      return 'transient_gateway_error';
    }
    return null;
  }

  async function copyPixPayload() {
    if (!result?.qrCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(result.qrCode);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2200);
    }
  }

  async function handlePay(method: 'pix' | 'crypto') {
    if (method === 'crypto') {
      setResult(null);
      setLimitationKey(null);
      setError('Pagamento em cripto ficará disponível nas próximas fases. Use PIX para concluir agora.');
      return;
    }

    setLoading(method);
    setError(null);
    setLimitationKey(null);
    setCopyState('idle');
    setResult(null);
    try {
      const d = digitsOnly(payerDoc);
      if (payerDoc.trim().length > 0 && !isValidBrCpfCnpjLength(d)) {
        setError('CPF/CNPJ inválido: informe 11 dígitos (CPF) ou 14 (CNPJ).');
        setLoading(null);
        return;
      }

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          method,
          ...(method === 'pix' ? { cpfCnpj: payerDoc } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setError('Você já possui uma máquina ativa. Aguarde o término para contratar outra.');
        } else {
          const apiError = typeof data?.error === 'string' ? data.error : null;
          const mappedKey = inferLimitationKey(
            typeof data?.limitation === 'string' ? data.limitation : apiError
          );
          if (mappedKey) {
            setLimitationKey(mappedKey);
          }
          setError(apiError || 'Erro ao criar pagamento. Tente novamente.');
        }
        return;
      }
      if (data.provider !== 'asaas' || looksLikeLegacyMockClientResponse(data)) {
        setError(
          'Resposta de pagamento incompatível (cache ou deploy antigo). Limpe o cache do site, faça redeploy na Vercel com a pasta raiz do app em "CLOUDPC" e variáveis ASAAS_*.'
        );
        return;
      }
      setResult({
        paymentId: data.paymentId,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        redirectUrl: data.redirectUrl,
        method,
      });
    } catch {
      setLimitationKey('transient_gateway_error');
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="checkout-card rounded-xl p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Pagamento via PIX</h3>
            <p className="mt-1 text-sm text-slate-300">
              Gere o QR Code instantaneamente e confirme para provisionar sua máquina.
            </p>
          </div>
          <PaymentStatusBadge status="pending_payment" variant="compact" />
        </div>

        <label htmlFor="payer-doc" className="mb-2 block text-sm font-medium text-slate-100">
          CPF ou CNPJ (titular do PIX)
        </label>
        <input
          id="payer-doc"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Somente números — CPF 11 ou CNPJ 14 dígitos"
          value={payerDoc}
          onChange={(e) => setPayerDoc(e.target.value)}
          disabled={!!loading}
          className="mb-3 w-full rounded-lg border border-violet-300/30 bg-[#12121c] px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400 disabled:opacity-70"
        />
        <p className="mb-4 text-xs leading-relaxed text-slate-300">
          Usado para cadastrar o titular no gateway de pagamento (Asaas). Pontuação é opcional. Se for seu primeiro
          PIX, o documento fica associado à sua conta para as próximas cobranças.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => handlePay('pix')}
            disabled={!!loading}
            className="relative flex-1 rounded-lg border border-violet-300/50 bg-violet-500/20 px-4 py-3 text-left font-semibold text-violet-100 transition hover:bg-violet-500/30 disabled:opacity-60"
          >
            <span className="absolute -top-2 right-2 rounded bg-violet-500 px-2 py-0.5 text-xs font-medium text-white">
              Recomendado
            </span>
            <span className="block">Gerar PIX agora</span>
            <span className="mt-1 block text-xs font-medium text-violet-200">
              QR + código copia e cola com confirmação em tempo real.
            </span>
          </button>
          <button
            type="button"
            onClick={() => handlePay('crypto')}
            disabled={!!loading}
            className="flex-1 rounded-lg border border-slate-500/40 bg-[#101017] px-4 py-3 text-left font-medium text-slate-300 transition hover:border-slate-400/60 hover:bg-[#141420] disabled:opacity-60"
          >
            <span className="block">Cripto (indisponível nesta fase)</span>
            <span className="mt-1 block text-xs text-slate-400">
              Esta opção permanece visível, mas ainda não pode ser usada em produção.
            </span>
          </button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-sm text-violet-100">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-violet-300 status-glow-pulse" />
            Gerando QR Code PIX...
          </div>
        )}
      </div>

      {limitationKey && (
        <div className="checkout-card rounded-xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold text-amber-50">Limitação temporária em produção</p>
          <p className="mt-1">{PRODUCTION_LIMITATION_MESSAGES[limitationKey]}</p>
          <button
            type="button"
            onClick={() => handlePay('pix')}
            disabled={!!loading}
            className="mt-3 inline-flex min-h-[40px] items-center rounded-md border border-amber-200/50 bg-amber-400/10 px-3 py-1.5 font-medium text-amber-50 transition hover:bg-amber-400/20 disabled:opacity-60"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {error && (
        <div className="checkout-card rounded-xl border border-rose-400/35 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {result && (
        <div className="pix-qr-card rounded-xl p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              {result.method === 'crypto' ? 'Pagamento em cripto' : 'QR Code PIX'}
            </h3>
            <PaymentStatusBadge status="pending_payment" variant="compact" />
          </div>

          <p className="mb-4 text-sm text-slate-200">
            Escaneie o QR Code no app do banco ou copie o código PIX para pagar.
          </p>

          {result.qrCodeBase64 && (
            <div className="mb-4 flex justify-center rounded-lg bg-white p-3">
              <Image
                src={`data:image/png;base64,${result.qrCodeBase64}`}
                alt="QR Code PIX"
                width={256}
                height={256}
                unoptimized
                className="max-w-xs rounded-lg border border-gray-200"
              />
            </div>
          )}
          {result.qrCode && (
            <div className="mb-4 rounded-lg border border-violet-300/35 bg-[#0f1018] p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-200">
                Código copia e cola
              </p>
              <div className="font-mono text-sm break-all text-slate-100">{result.qrCode}</div>
              <button
                type="button"
                onClick={copyPixPayload}
                className="mt-3 inline-flex min-h-[40px] items-center rounded-md border border-violet-300/45 bg-violet-500/10 px-3 py-1.5 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
              >
                {copyState === 'copied'
                  ? 'Copiado!'
                  : copyState === 'error'
                    ? 'Falha ao copiar'
                    : 'Copiar código PIX'}
              </button>
            </div>
          )}
          {result.redirectUrl && (
            <a
              href={result.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-block rounded-lg border border-violet-300/45 bg-violet-500/20 px-4 py-2 font-medium text-violet-50 transition hover:bg-violet-500/30"
            >
              Abrir página de pagamento
            </a>
          )}
          <p className="text-sm text-slate-300">
            ID do pagamento:{' '}
            <code className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-slate-100">
              {result.paymentId}
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
