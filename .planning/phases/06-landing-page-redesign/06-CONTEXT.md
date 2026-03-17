# Phase 6: Landing Page Redesign — Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Premium, high-conversion homepage that clearly explains the product (cloud gaming PC rental, GPU, Parsec, fixed-time packages), builds trust quickly, and drives users toward /plans. Frontend only. Use UI UX Pro Max skill throughout.

</domain>

<decisions>
## Implementation Decisions

### Trust Signals
- Use a mix: trust badges, guarantee/reassurance badges, infrastructure trust points, simple credibility blocks
- Keep it realistic and conversion-focused
- **No fake testimonials** pretending to be real customers
- If testimonials are included, they must be clearly placeholders or omitted for now
- Good trust elements for this phase:
  - Infraestrutura no Brasil
  - Provisionamento rápido
  - PIX e cripto
  - Sem fidelidade
  - Ativação em minutos
  - Suporte a jogos, edição e programação

### Hero & Above-the-Fold
- One strong primary CTA: "Ver planos"
- One secondary CTA: "Como funciona" or soft anchor to explanation section
- Do not split attention with too many actions
- Homepage should push users toward /plans, not create decision overload

### Visual Style Direction
- Refine the current dark premium style (do not move to lighter SaaS)
- Keep: dark mode first, indigo/violet accents, premium technical feeling, subtle gaming influence
- Avoid: childish, exaggerated, or too "RGB gamer" look
- Result should feel: premium, modern, fast, trustworthy

### Section Structure & Order
- Adjust structure for stronger conversion
- Order:
  1. Hero
  2. Trust / credibility strip (moved up — right after hero to reduce hesitation)
  3. Value explanation
  4. Use cases
  5. How it works
  6. Performance / power
  7. Plans preview
  8. Final CTA
- Keep page clear and focused
- Avoid unnecessary sections or excessive text
- User should understand value in seconds and be guided naturally toward /plans

### Claude's Discretion
- Exact badge/block layout and visual treatment
- Secondary CTA placement and anchor behavior
- Typography refinements within the style
- Spacing and section transitions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` — Phase 6 goal, requirements, success criteria
- `.planning/REQUIREMENTS.md` — LAND-01, LAND-02, LAND-03, LAND-04

### Design & UX
- `skills/ui-ux-pro-max/SKILL.md` — UI UX Pro Max guidelines (accessibility, hierarchy, touch targets, contrast)
- `src/app/globals.css` — Design tokens, dark mode, glassmorphism variables

### Implementation
- `src/app/page.tsx` — Current landing page (sections, components, structure)
- `src/components/NavBar.tsx` — Nav integration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `page.tsx` — ValueCard, UseCaseCard, StepCard, PerfCard, TrustCard components (inline)
- Design tokens in `globals.css`: `--color-primary`, `--glass-bg`, `.dark-plans` tokens
- Lucide icons: Cpu, Zap, Shield, MapPin, CreditCard, Clock, Gamepad2, Video, Code2, Layers, ChevronRight, Check

### Established Patterns
- Dark layout: `dark-layout` class, `bg-[#050506]`, `bg-[#0a0a0c]` alternating sections
- Gradient accents: `from-indigo-500 to-violet-600`, `text-indigo-400`
- Cards: `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm`
- CTA: `min-h-[52px]`, gradient button, focus ring, `active:scale-[0.98]`
- Skip link for accessibility (sr-only, focus:block)
- Portuguese (pt-BR) copy throughout

### Integration Points
- Route: `/` (src/app/page.tsx)
- NavBar in layout.tsx — links to /plans, /login, /signup
- Plans page at /plans — conversion target

</code_context>

<specifics>
## Specific Ideas

- Trust strip should appear immediately after hero — reduce hesitation fast
- "Como funciona" as secondary CTA (anchor to How it works section)
- Trust elements: Infra Brasil, Provisionamento rápido, PIX e cripto, Sem fidelidade, Ativação em minutos, Suporte a jogos/edição/programação
- Premium, modern, fast, trustworthy — not childish or RGB gamer

</specifics>

<deferred>
## Deferred Ideas

- Real customer testimonials — when available, can be added in a future phase
- A/B testing or analytics integration — out of scope for v1.1 frontend polish

</deferred>

---
*Phase: 06-landing-page-redesign*
*Context gathered: 2026-03-17*
