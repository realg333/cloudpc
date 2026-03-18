# Relatório de Scan: Sessão não mantém — sempre pede para relogar

## Resumo executivo

O app usa sessão via cookie JWT + banco (Prisma/Session). A sessão pode falhar por várias causas. Este scan identifica **causas prováveis** e **ações recomendadas**.

---

## 1. Arquitetura atual de sessão

| Componente | Implementação |
|-----------|---------------|
| **Cookie** | `session` (httpOnly, secure em prod, sameSite: lax, path: /) |
| **Duração** | 8 horas (`SESSION_DURATION_HOURS`) |
| **Armazenamento** | JWT assinado com `sessionId` → lookup em `Session` no banco |
| **Leitura** | `getSessionFromCookies()` usa `cookies()` de `next/headers` |
| **Escrita** | `createSession()` em Route Handlers (login, 2FA verify) |

---

## 2. Causas prováveis (prioridade)

### Alta prioridade

#### 2.1 URL base incorreta em produção (logout, 2FA, signup)

**Problema:** Logout, 2FA verify e signup usam `request.url` para redirect. Em Vercel/proxy, `request.url` pode ser a URL interna (ex: `https://internal.vercel.app`), não a URL pública.

**Arquivos afetados:**
- `src/app/(auth)/logout/route.ts` — `new URL('/', request.url)`
- `src/app/api/auth/two-factor/verify/route.ts` — `new URL('/', request.url)`
- `src/app/api/auth/signup/route.ts` — vários redirects
- `src/app/(auth)/verify-email/route.ts`

**Impacto:** O redirect pode ir para domínio errado. O `Set-Cookie` de logout pode não ser aplicado no domínio correto, e o usuário pode parecer “deslogado” ou em estado inconsistente.

**Correção:** Usar `getBaseUrl(request)` (como no login) em todos os redirects:

```ts
function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}
```

---

#### 2.2 `SESSION_SECRET` ausente ou inconsistente

**Problema:** Se `SESSION_SECRET` não estiver definido em produção ou for diferente entre deploys, o JWT não valida e `getSessionFromCookies()` retorna `null`.

**Verificação:**
```bash
# No Vercel: Settings → Environment Variables
# Garantir SESSION_SECRET definido (ex: openssl rand -base64 32)
```

---

#### 2.3 Cookie `secure` em ambiente HTTP

**Problema:** Em produção, `secure: process.env.NODE_ENV === 'production'`. Se o app for acessado via HTTP (ex: sem HTTPS), o navegador não envia o cookie.

**Verificação:** Confirmar que o domínio usa HTTPS em produção.

---

### Média prioridade

#### 2.4 Prefetch do Next.js e cookies

**Problema:** Com `<Link href="...">`, o Next.js pode fazer prefetch antes do cookie estar disponível. A doc do Supabase menciona isso para tokens em cookies.

**Mitigação atual:** `export const dynamic = 'force-dynamic'` no layout raiz já reduz cache. Pode ser útil desabilitar prefetch em links críticos:

```tsx
<Link href="/dashboard" prefetch={false}>Minhas Máquinas</Link>
```

---

#### 2.5 `cookies()` em Server Components (Next.js 15)

**Problema:** Há relatos de falhas intermitentes ao ler cookies com `await cookies().get()` em Server Components no Next.js 15 (ex.: issue #78831). O autor fechou como “erro de uso” (middleware vs `cookies()`), mas o padrão de falha intermitente pode existir em outros cenários.

**Contexto:** O projeto usa `getSessionFromCookies()` em Server Components (NavBar, dashboard, etc.). Não há middleware.

**Mitigação:** Se o problema continuar, considerar fallback: em Route Handlers, usar `request.cookies.get()` em vez de `cookies()`.

---

#### 2.6 Conexão com banco (Supabase + PgBouncer)

**Problema:** Com pooler (porta 6543 + `?pgbouncer=true`), transações podem se comportar diferente. Se a sessão for criada em uma conexão e a leitura em outra, pode haver atraso ou inconsistência.

**Verificação:** Conferir se `DATABASE_URL` usa o pooler corretamente e se não há erro de conexão nos logs.

---

### Baixa prioridade

#### 2.7 Domínio do cookie

**Problema:** O cookie não define `domain`. O padrão é o host atual. Em subdomínios (ex: `app.xxx.com` vs `www.xxx.com`), pode haver divergência.

**Ação:** Só ajustar se houver múltiplos subdomínios.

---

## 3. Checklist de verificação

- [ ] `SESSION_SECRET` definido em produção (Vercel env vars)
- [ ] `getBaseUrl()` usado em logout, 2FA verify, signup e verify-email
- [ ] App em HTTPS em produção
- [ ] `DATABASE_URL` com pooler (6543) e `?pgbouncer=true` se Supabase
- [ ] Testar fluxo completo: login → navegar → refresh → logout

---

## 4. Ações recomendadas (ordem)

1. **Imediato:** Padronizar `getBaseUrl()` em logout, 2FA verify, signup e verify-email.
2. **Imediato:** Confirmar `SESSION_SECRET` em produção.
3. **Opcional:** Desabilitar prefetch em links sensíveis (`prefetch={false}`).
4. **Se persistir:** Adicionar logs temporários em `getSessionFromCookies()` para ver quando retorna `null` (token ausente vs JWT inválido vs sessão expirada no banco).

---

## 5. Próximos passos (GSD)

Para tratar isso como fase GSD:

- **Discussão:** Definir escopo (só correções de URL ou também prefetch, logs, etc.).
- **Plano:** Criar `PLAN.md` com tarefas e critérios de aceite.
- **Execução:** Aplicar correções e validar em staging/produção.
