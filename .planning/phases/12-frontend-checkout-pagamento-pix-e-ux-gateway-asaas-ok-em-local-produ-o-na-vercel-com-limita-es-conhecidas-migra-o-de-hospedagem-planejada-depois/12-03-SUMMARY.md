---
phase: 12-frontend-checkout-pagamento-pix-e-ux-gateway-asaas-ok-em-local-produ-o-na-vercel-com-limita-es-conhecidas-migra-o-de-hospedagem-planejada-depois
plan: 03
subsystem: ui
tags: [nextjs, responsive-ui, vitest, payments, tailwind]
requires:
  - phase: 12-01
    provides: contrato base de status e estilos de pagamentos
  - phase: 12-02
    provides: fluxo de pagamento com copy de limitacoes em producao
provides:
  - pagina Meus pedidos responsiva com cartoes mobile e tabela densa no desktop
  - status de pagamento com badge padronizado e orientacao para cenarios de confirmacao atrasada
  - suite de contrato Vitest para labels, classes visuais e copy de limitacao em producao
affects: [phase-12, payments-ui, orders-ux, regression-protection]
tech-stack:
  added: []
  patterns:
    - mapa de status frontend com contrato explicito de classe visual e CTA
    - layout responsivo dual-mode (cards em mobile, tabela em desktop)
key-files:
  created:
    - src/lib/payments/payment-ui.test.ts
  modified:
    - src/app/orders/page.tsx
    - src/lib/payments/payment-ui.ts
    - src/components/PaymentStatusBadge.tsx
key-decisions:
  - "Usar PaymentStatusBadge em todas as visualizacoes de status de pedidos para consistencia visual."
  - "Manter CTA Pagar sempre visivel para pending_payment em mobile e desktop."
  - "Centralizar badgeClassName e ctaText dentro de PAYMENT_STATUS_UI para proteger contrato por teste."
patterns-established:
  - "Status contract: todo status frontend precisa de label, hint e badgeClassName."
  - "Critical statuses contract: pending_payment, provisioning e error exigem CTA textual."
requirements-completed: [FE-01, FE-03, FE-05]
duration: 2min
completed: 2026-03-24
---

# Phase 12 Plan 03: Orders Responsive UX and Status Contract Summary

**Historico de pedidos responsivo com badges padronizados e contrato de status/copy protegido por Vitest para evitar regressao de UX de pagamento.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T19:43:48Z
- **Completed:** 2026-03-24T19:45:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Reestruturada a pagina `Meus pedidos` para cards mobile-first (sem scroll horizontal forcado) e tabela densa no desktop.
- Integrado `PaymentStatusBadge` com orientacao explicita para cenarios de confirmacao atrasada e CTA `Pagar` sempre descobrivel em pedidos pendentes.
- Criado teste de contrato `payment-ui.test.ts` garantindo labels, chaves de limitacao em producao e campos obrigatorios para statuses criticos.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rework orders page into responsive cards plus desktop table density** - `75ff217` (feat)
2. **Task 2: Add Vitest contract for payment status and production limitation copy (RED)** - `c3db932` (test)
3. **Task 2: Add Vitest contract for payment status and production limitation copy (GREEN)** - `bb9b1d7` (feat)

## Files Created/Modified

- `src/app/orders/page.tsx` - novo layout responsivo, badge de status, orientacoes de pending/provisioning e camada ambiental sutil.
- `src/lib/payments/payment-ui.test.ts` - contrato automatizado de labels, chaves de limitacao e campos criticos por status.
- `src/lib/payments/payment-ui.ts` - ampliado contrato com `badgeClassName` e `ctaText` para statuses criticos.
- `src/components/PaymentStatusBadge.tsx` - passa a consumir classe mapeada no contrato central de status.

## Decisions Made

- Usar o mesmo mapa `PAYMENT_STATUS_UI` como fonte de verdade para copy e classe visual reduz drift entre UI e testes.
- Tratar `pending_payment`, `provisioning` e `error` como statuses criticos para acao explicita na UX.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added mapped badge class consumption in `PaymentStatusBadge`**
- **Found during:** Task 2 (GREEN implementation)
- **Issue:** Test passaria com novos campos no contrato, mas o componente ainda poderia divergir usando classe derivada por string.
- **Fix:** `PaymentStatusBadge` passou a usar `config.badgeClassName`, mantendo o runtime alinhado ao contrato testado.
- **Files modified:** `src/components/PaymentStatusBadge.tsx`
- **Verification:** `npm run test -- src/lib/payments/payment-ui.test.ts` e lint sem erros.
- **Committed in:** `bb9b1d7` (part of task commit)

---

**Total deviations:** 1 auto-fixed (Rule 2)
**Impact on plan:** Sem impacto de escopo; reforco de corretude para evitar divergencia entre contrato e renderizacao.

## Issues Encountered

- Nenhum bloqueio. Fluxo TDD executado com RED (1 falha esperada) seguido de GREEN.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Fase 12 plan 03 pronta para continuidade com UX de pedidos responsiva e contrato de copy/status protegido.
- Sem pendencias tecnicas abertas para este plano.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-frontend-checkout-pagamento-pix-e-ux-gateway-asaas-ok-em-local-produ-o-na-vercel-com-limita-es-conhecidas-migra-o-de-hospedagem-planejada-depois/12-03-SUMMARY.md`
- FOUND: `75ff217`
- FOUND: `c3db932`
- FOUND: `bb9b1d7`

---
*Phase: 12-frontend-checkout-pagamento-pix-e-ux-gateway-asaas-ok-em-local-produ-o-na-vercel-com-limita-es-conhecidas-migra-o-de-hospedagem-planejada-depois*
*Completed: 2026-03-24*
