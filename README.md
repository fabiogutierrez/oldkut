# oldkut

Rede social nostálgica estilo Orkut — perfil + mural de recados. Next.js (App Router + TypeScript) + Supabase, projeto independente do BrandGen AI.

## O que já funciona
- Cadastro/login por e-mail e senha (confirmação por e-mail via Supabase Auth)
- Perfil: nome de usuário, nome, foto (URL), cidade, aniversário, bio
- Mural de recados públicos no perfil (postar e excluir)

## Como rodar localmente

1. Crie um projeto no [Supabase](https://supabase.com) e rode a migration em `supabase/migrations/0001_init.sql` (SQL Editor ou `supabase db push`).
2. Copie `.env.example` para `.env.local` e preencha com a URL e a anon key do seu projeto Supabase.
3. Em **Authentication → URL Configuration** no Supabase, adicione `http://localhost:3000/auth/callback` (e, em produção, `https://SEU-DOMINIO/auth/callback`) como redirect URL.

```
npm install
npm run dev
```

Abre em `http://localhost:3000`.

## Deploy

Conecte este repositório a um projeto novo na Vercel e configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Próximos passos
- [ ] Comunidades
- [ ] Lista de amigos / pedidos de amizade
- [ ] Depoimentos públicos no perfil
- [ ] Upload de foto (hoje é só uma URL)
