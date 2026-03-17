# Supabase + Vercel — Connection Pooler

O Vercel não consegue alcançar a conexão direta do Supabase (porta 5432). É preciso usar o **Connection Pooler** (Transaction mode).

## Como obter a string correta

1. Abra o **Supabase Dashboard** → Connect: https://supabase.com/dashboard/project/roqzbhvzjtipzfzesnqp/settings/database  
2. Clique em **Connect** (ou **Project Settings** → **Database**)  
3. Em **Connection string**, escolha **URI**  
4. Selecione **Connection pooling** → **Transaction** (porta 6543)  
5. Copie a string exata  
6. Adicione `?pgbouncer=true` no final (necessário para Prisma)  
   - Exemplo: `...postgres?pgbouncer=true`  
   - Se já houver `?`, use `&pgbouncer=true`

## Atualizar no Vercel

1. **Vercel Dashboard** → projeto **cloudpc** → **Settings** → **Environment Variables**  
2. Edite `DATABASE_URL` e cole a string do pooler (com `?pgbouncer=true`)  
3. Marque **Production** e **Preview**  
4. Faça um novo deploy: `vercel --prod`

## Formato esperado

A string deve ter um destes formatos:

- `postgres://postgres.[ref]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
- Ou `postgres://postgres:[PASSWORD]@db.[ref].supabase.co:6543/postgres?pgbouncer=true`

A região (`aws-0-us-east-1`, `aws-0-sa-east-1`, etc.) depende do projeto e aparece no painel do Supabase.
