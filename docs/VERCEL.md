# Deploy na Vercel

## Root Directory (obrigatório se o repositório Git tiver pasta pai)

Se o clone do Git tiver esta estrutura:

```text
repo/
  package.json          ← delegador (opcional)
  CLOUDPC/              ← app Next.js (next.config.mjs, src/, prisma/)
    package.json
```

No painel Vercel → **Settings → General → Root Directory**, defina:

**`CLOUDPC`**

Assim o build usa o Next.js correto. Se a raiz do Git for **só** a pasta do app (sem pai), deixe Root Directory vazio.

## Variáveis de ambiente (pagamento Asaas)

- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_DEFAULT_CUSTOMER_DOCUMENT` (CPF/CNPJ só dígitos, para criar cliente na primeira cobrança)
- Opcional: `ASAAS_API_BASE_URL` (sandbox vs produção)

Sem essas chaves, a API de pagamento não gera PIX real.

## Sobre respostas “mock” no browser

O código atual **não** inclui gateway mock. Se ainda aparecer `mock_…` ou `mock-qr-code`, é **build antigo em cache**, **deploy de outra branch**, ou **Root Directory** apontando para a pasta errada.

Após corrigir, faça **Redeploy** e um hard refresh (Ctrl+Shift+R).
