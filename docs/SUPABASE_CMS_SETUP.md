# Ativação do CMS do blog

O painel em `/admin/` usa autenticação por e-mail e senha do Supabase. O navegador recebe somente a publishable key; permissões reais são impostas no PostgreSQL por grants mínimos e Row Level Security (RLS).

## 1. Criar e conectar o projeto

1. Crie um projeto de produção no Supabase e guarde a senha do banco em um gerenciador de senhas.
2. Copie `.env.example` para `.env`.
3. Preencha `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_PUBLISHABLE_KEY` em desenvolvimento e no provedor de hospedagem.
4. Nunca exponha a `service_role` com prefixo `PUBLIC_`.
5. Execute `npx supabase@latest login` e `npx supabase@latest link --project-ref SEU_PROJECT_REF`.
6. Revise a diferença com `npx supabase@latest db diff --linked` e aplique `npx supabase@latest db push`.

O esquema versionado está em `supabase/schemas/01_blog.sql`; a criação do bucket está em `supabase/seed.sql`.

## 2. Criar o primeiro administrador

1. No Dashboard, abra **Authentication > Users** e crie o usuário manualmente. O cadastro público está desativado.
2. Copie o UUID do usuário.
3. No SQL Editor, execute substituindo os valores:

```sql
insert into public.admin_profiles (user_id, role, display_name)
values ('UUID_DO_USUARIO', 'admin', 'Nome do administrador');
```

Use uma senha exclusiva com pelo menos 12 caracteres. O painel verifica a sessão e a autorização em `admin_profiles`; possuir uma conta Auth sem perfil ativo não libera o editor.

## 3. Fluxo de publicação

1. O editor salva rascunhos e artigos publicados pelo painel `/admin/`.
2. `npm run sync:blog` lê somente posts publicados que a política pública permite.
3. `npm run build` executa essa sincronização automaticamente antes de gerar o site.
4. Configure no provedor um deploy hook chamado pelo processo editorial após publicar ou editar um artigo.

O site público continua estático. Isso mantém HTML indexável, baixo custo de execução e bom desempenho. A publicação aparece no site depois do rebuild concluído.

## 4. Segurança e operação

- Ative MFA para administradores no Supabase quando o projeto estiver conectado.
- Use ambientes Supabase separados para homologação e produção.
- Não edite políticas diretamente em produção sem registrar a mudança em `supabase/schemas/`.
- Verifique periodicamente usuários ativos em `admin_profiles` e desative acessos que não forem mais necessários.
- Configure backups/PITR conforme o plano contratado e faça um teste real de restauração.
- Restrinja o acesso ao Dashboard da organização aos responsáveis técnicos.
- Mantenha logs de autenticação e banco sob revisão.
- O bucket aceita apenas JPEG, PNG, WebP e AVIF, com limite de 5 MB definido em `supabase/seed.sql`.

## 5. Validação antes de publicar

- Login correto e senha incorreta.
- Usuário Auth sem perfil ativo não consegue acessar.
- Editor cria e atualiza, mas não apaga.
- Admin apaga somente após confirmação.
- Visitante anônimo lê apenas artigos publicados e já datados.
- Upload acima de 5 MB ou fora dos formatos permitidos é rejeitado.
- Um artigo publicado aparece no RSS, sitemap e rota pública depois do rebuild.
