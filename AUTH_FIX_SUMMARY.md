# Correções de Autenticação/Autorização — Resumo

## Causas raiz identificadas

### Bug 1: Admin não vê o painel
- **Causa**: O sistema usava apenas `user.isAdmin` do banco. O seed com `ADMIN_EMAIL` fazia match exato (case-sensitive). Se o email no .env não coincidisse exatamente com o do banco, ou se o seed não tivesse sido executado após criar o usuário, o admin não tinha acesso.
- **Correção**: Criada função `isUserAdmin(user)` que verifica: 1) `user.isAdmin` do banco; 2) `ADMIN_EMAIL` do env (comparação case-insensitive, com trim). O admin passa a ser reconhecido em runtime mesmo sem rodar o seed.

### Bug 2: Loop infinito de autenticação
- **Causas prováveis**:
  1. **Cache de RSC**: Páginas com sessão podiam ser cacheadas, retornando estado "não autenticado".
  2. **Cookie de logout**: Ao limpar a sessão, o cookie não usava `secure` e `sameSite`, impedindo a remoção correta em produção.
  3. **URL de redirect**: Em produção (Vercel), `request.url` pode não refletir o host correto; uso de `x-forwarded-host` e `x-forwarded-proto` garante a URL base certa.
  4. **Usuário logado em /login**: Usuário autenticado em /login não era redirecionado, gerando confusão e possíveis loops.
- **Correções**: `force-dynamic` no layout raiz, cookie de logout com `secure` e `sameSite`, `getBaseUrl()` para redirects, redirect de usuário logado em /login.

---

## Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/auth/admin.ts` | `isUserAdmin()` com check de `ADMIN_EMAIL` (case-insensitive) |
| `src/lib/auth/session.ts` | Cookie de logout com `secure` e `sameSite` |
| `src/app/layout.tsx` | `export const dynamic = 'force-dynamic'` |
| `src/app/api/auth/login/route.ts` | `getBaseUrl()`, suporte a `redirect`, URLs corretas |
| `src/app/(auth)/login/page.tsx` | Server component com redirect se já logado |
| `src/app/(auth)/login/LoginForm.tsx` | Novo componente client com props |
| `src/components/NavBar.tsx` | Uso de `isUserAdmin()` |
| `prisma/seed.ts` | Match case-insensitive para `ADMIN_EMAIL` |
| `src/app/billing/page.tsx` | Nova página (redirect para /orders) |
| `.env.example` | Documentação de `ADMIN_EMAIL` |

---

## Variáveis de ambiente para produção (Vercel)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string do Supabase. Use **Connection Pooler** (porta 6543) + `?pgbouncer=true` — ver `SUPABASE_VERCEL.md` |
| `SESSION_SECRET` | Sim | String aleatória para assinar cookies (ex: `openssl rand -base64 32`) |
| `ADMIN_EMAIL` | Opcional | Email do admin (case-insensitive). Ex: `admin@example.com` |
| `RESEND_API_KEY` | Sim* | Para emails de verificação (*se usar verificação) |
| `VULTR_API_KEY` | Sim* | Para provisionamento (*se usar VMs) |
| `CRON_SECRET` | Sim* | Para Vercel Cron (*se usar cron) |
| `ASAAS_*` | Sim | Pagamentos PIX (Asaas obrigatório) |

---

## Checklist de teste manual

### Usuário comum
- [ ] Criar conta
- [ ] Verificar email (link recebido)
- [ ] Fazer login
- [ ] Clicar em "Minhas Máquinas" no header — não redireciona para login
- [ ] Clicar em "Pedidos" — não redireciona para login
- [ ] Clicar em "Cobranças" — redireciona para Pedidos
- [ ] Clicar em "Perfil" — não redireciona para login
- [ ] Sair — redireciona para home
- [ ] Acessar /dashboard sem login — redireciona para /login?redirect=/dashboard
- [ ] Após login em /login?redirect=/dashboard — redireciona para /dashboard

### Usuário admin
- [ ] Login com email configurado em `ADMIN_EMAIL`
- [ ] Ver link "Admin" no header
- [ ] Acessar /admin — painel carrega
- [ ] Navegar normalmente (Dashboard, Pedidos, etc.)
- [ ] Sair e entrar novamente — admin continua funcionando

### Sessão
- [ ] Sessão mantida ao navegar entre páginas
- [ ] Sem loop de redirect
- [ ] Sem redirect indevido para login após login bem-sucedido

---

## Validação local e produção

### Local
```bash
npm run dev
# Testar fluxo completo de auth e admin
```

### Produção (Vercel)
1. Garantir env vars no Vercel (Settings → Environment Variables)
2. `DATABASE_URL` com pooler (6543) e `?pgbouncer=true`
3. `SESSION_SECRET` definido
4. `ADMIN_EMAIL` definido (se usar admin por env)
5. Deploy: `vercel --prod` ou push para branch principal
