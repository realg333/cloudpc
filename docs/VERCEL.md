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

- `ASAAS_API_KEY` (produção: `https://api.asaas.com`; sandbox: `https://api-sandbox.asaas.com` — chave e URL têm de ser do **mesmo** ambiente; o Asaas também devolve `invalid_environment` se misturar)
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_DEFAULT_CUSTOMER_DOCUMENT` (opcional: fallback se o cliente não preencher CPF/CNPJ no checkout; prioridade: checkout → cadastro `User.cpfCnpj` → esta variável)
- Opcional: `ASAAS_API_BASE_URL` (sandbox vs produção)

Sem essas chaves, a API de pagamento não gera PIX real.

**Ambiente na Vercel:** cada variável pode estar ligada só a **Production** ou só a **Preview**. Se o site aberto for um deploy de preview (URL `*.vercel.app` de branch) e a variável existir só em Production, o servidor não verá o valor — replique para o ambiente certo e faça **Redeploy**.

**Documento:** use um CPF ou CNPJ **válido** aceito pelo Asaas. Valores de exemplo (ex.: `12345678909`) costumam falhar na API mesmo com 11 dígitos.

**Confirmar que o deploy é o certo:** no navegador, abra DevTools → aba **Rede** → clique na requisição `POST /api/payments/create` → em **Cabeçalhos da resposta** deve existir `X-CloudPC-Payments-API: 2025-03-20`. Se esse cabeçalho **não** aparecer, o domínio ainda está servindo um build antigo (outro projeto Vercel, branch, pasta raiz errada ou cache). Faça redeploy do commit atual após **git push**.

## Sobre respostas “mock” no browser

O código atual **não** inclui gateway mock. Se ainda aparecer `mock_…` ou `mock-qr-code`, é **build antigo em cache**, **deploy de outra branch**, ou **Root Directory** apontando para a pasta errada.

Após corrigir, faça **Redeploy** e um hard refresh (Ctrl+Shift+R).
