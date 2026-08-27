-- Fonte de verdade do CMS editorial da Nova Belluno.
-- Todas as tabelas expostas pela Data API usam grants mínimos + RLS.

create table public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'editor' check (role in ('editor', 'admin')),
  display_name text not null check (char_length(display_name) between 2 and 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.admin_profiles is
  'Autorizações editoriais. Inclusões e alterações são feitas somente por administradores no servidor ou Dashboard.';

alter table public.admin_profiles enable row level security;
revoke all on table public.admin_profiles from anon, authenticated;
grant select on table public.admin_profiles to authenticated;

create policy "Editor can read own authorization"
on public.admin_profiles
for select
to authenticated
using ((select auth.uid()) = user_id and is_active);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 10 and 120),
  description text not null check (char_length(description) between 30 and 180),
  body_markdown text not null check (char_length(body_markdown) >= 100),
  author text not null default 'Equipe Nova Belluno' check (char_length(author) between 2 and 80),
  category text not null check (category in ('Cuidados', 'Bem-estar', 'Família', 'Envelhecimento')),
  tags text[] not null default '{}',
  cover_image text not null check (cover_image like '/%' or cover_image ~ '^https://'),
  cover_alt text not null check (char_length(cover_alt) between 10 and 180),
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 180),
  canonical_url text check (canonical_url is null or canonical_url ~ '^https://'),
  published_at timestamptz,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_post_has_date check (status <> 'published' or published_at is not null)
);

comment on table public.blog_posts is
  'Artigos, rascunhos e metadados de SEO do blog da Nova Belluno.';

create index blog_posts_public_feed_idx
  on public.blog_posts (published_at desc)
  where status = 'published';

create index blog_posts_category_idx
  on public.blog_posts (category, published_at desc)
  where status = 'published';

alter table public.blog_posts enable row level security;
revoke all on table public.blog_posts from anon, authenticated;
grant select on table public.blog_posts to anon, authenticated;
grant insert, delete on table public.blog_posts to authenticated;
grant update (
  slug, title, description, body_markdown, author, category, tags,
  cover_image, cover_alt, featured, status, seo_title, seo_description,
  canonical_url, published_at, updated_at
) on table public.blog_posts to authenticated;

create policy "Published posts are public"
on public.blog_posts
for select
to anon
using (status = 'published' and published_at <= now());

create policy "Active editors can read all posts"
on public.blog_posts
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  )
);

create policy "Active editors can create posts"
on public.blog_posts
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  )
);

create policy "Active editors can update posts"
on public.blog_posts
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  )
);

create policy "Active admins can delete posts"
on public.blog_posts
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and profile.role = 'admin'
  )
);

-- O bucket blog-media é público para servir capas no site estático, mas
-- somente editores ativos escrevem e somente administradores apagam.
create policy "Published blog media is public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-media');

create policy "Active editors can upload blog media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-media'
  and exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  )
);

create policy "Active editors can update blog media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-media'
  and exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  )
)
with check (
  bucket_id = 'blog-media'
  and exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  )
);

create policy "Active admins can delete blog media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-media'
  and exists (
    select 1
    from public.admin_profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and profile.role = 'admin'
  )
);
