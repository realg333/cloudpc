'use client';

import { useState } from 'react';

interface PaymentFormProps {
  orderId: string;
}

export default function PaymentForm({ orderId }: PaymentFormProps) {
  const [loading, setLoading] = useState<'pix' | 'crypto' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    paymentId: string;
    qrCode?: string;
    redirectUrl?: string;
    method: 'pix' | 'crypto';
  } | null>(null);

  async function handlePay(method: 'pix' | 'crypto') {
    setLoading(method);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, method }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setError('Você já possui uma máquina ativa. Aguarde o término para contratar outra.');
        } else {
          setError(data.error || 'Erro ao criar pagamento. Tente novamente.');
        }
        return;
      }
      setResult({
        paymentId: data.paymentId,
        qrCode: data.qrCode,
        redirectUrl: data.redirectUrl,
        method,
      });
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Escolha a forma de pagamento</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => handlePay('crypto')}
            disabled={!!loading}
            className="relative flex-1 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-3 font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          >
            <span className="absolute -top-2 right-2 rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
              Recomendado
            </span>
            Pagar com Cripto
          </button>
          <button
            type="button"
            onClick={() => handlePay('pix')}
            disabled={!!loading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Pagar com PIX
          </button>
        </div>
        {loading && (
          <p className="mt-3 text-sm text-gray-600">
            {loading === 'crypto' ? 'Criando pagamento em cripto...' : 'Gerando QR Code PIX...'}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            {result.method === 'crypto' ? 'Pagamento em cripto' : 'QR Code PIX'}
          </h3>
          {result.qrCode && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm break-all">
              {result.qrCode}
            </div>
          )}
          {result.redirectUrl && (
            <a
              href={result.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Abrir página de pagamento
            </a>
          )}
          <p className="text-sm text-gray-600">
            ID do pagamento: <code className="rounded bg-gray-100 px-1">{result.paymentId}</code>
          </p>
        </div>
      )}
    </div>
  );
}
