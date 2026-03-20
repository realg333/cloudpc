# Fase 9.2 — PIX (Asaas) — Runbook

## Variáveis de ambiente (Vercel / `.env`)

- `ASAAS_API_KEY` — chave de API (header `access_token` nas requisições)
- `ASAAS_WEBHOOK_TOKEN` — token configurado no webhook no painel Asaas (header `asaas-access-token` nas chamadas recebidas)
- `ASAAS_API_BASE_URL` — opcional; padrão `https://api.asaas.com`. Sandbox: `https://api-sandbox.asaas.com`
- `ASAAS_DEFAULT_CUSTOMER_DOCUMENT` — CPF ou CNPJ (somente dígitos) usado ao **criar** cliente Asaas na primeira cobrança; obrigatório quando ainda não existe cliente com `externalReference` = id do usuário
- `DATABASE_URL` — após migration, inclui `Order.gatewayChargeId` e `User.asaasCustomerId`

## Webhook

1. No painel Asaas: Integrações → Webhooks → URL: `https://<seu-dominio>/api/webhooks/payments`
2. Informe o mesmo valor de `ASAAS_WEBHOOK_TOKEN` na configuração do webhook
3. Inscreva eventos de cobrança (ex.: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`)

## Fluxo verificado

- `POST /api/payments/create` com PIX garante cliente Asaas, cria cobrança `billingType=PIX`, grava `gatewayChargeId` e retorna `qrCode` / `qrCodeBase64`.
- Webhook valida `asaas-access-token`, interpreta o corpo e executa o pipeline idempotente (`PaymentLog`, `Order`, `Payment`, `ProvisioningJob`).

O fluxo de pagamento usa apenas **Asaas / PIX**; **crypto** retorna HTTP 400 até ser configurado.
