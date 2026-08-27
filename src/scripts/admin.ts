import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase-browser';

type PostStatus = 'draft' | 'published' | 'archived';
type AdminRole = 'editor' | 'admin';

interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  body_markdown: string;
  author: string;
  category: 'Cuidados' | 'Bem-estar' | 'Família' | 'Envelhecimento';
  tags: string[];
  cover_image: string;
  cover_alt: string;
  featured: boolean;
  status: PostStatus;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  published_at: string | null;
  updated_at: string;
}

const byId = <T extends HTMLElement>(id: string) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento obrigatório ausente: #${id}`);
  return element as T;
};

const status = byId<HTMLParagraphElement>('admin-status');
const loginSection = byId<HTMLElement>('admin-login');
const loginForm = byId<HTMLFormElement>('admin-login-form');
const workspace = byId<HTMLElement>('admin-workspace');
const editorForm = byId<HTMLFormElement>('admin-editor-form');
const postList = byId<HTMLDivElement>('admin-post-list');
const editorTitle = byId<HTMLHeadingElement>('editor-title');
const editorState = byId<HTMLSpanElement>('editor-state');
const titleInput = byId<HTMLInputElement>('post-title');
const slugInput = byId<HTMLInputElement>('post-slug');
const coverFileInput = byId<HTMLInputElement>('post-cover-file');
const coverImageInput = byId<HTMLInputElement>('post-cover-image');
const saveButton = byId<HTMLButtonElement>('admin-save-post');

let currentUser: User | null = null;
let currentRole: AdminRole = 'editor';
let posts: BlogPostRow[] = [];
let slugWasEdited = false;

function setStatus(message: string, tone: 'neutral' | 'success' | 'error' = 'neutral') {
  status.textContent = message;
  status.dataset.tone = tone;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function updateCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((counter) => {
    const input = document.getElementById(counter.dataset.counter ?? '') as HTMLInputElement | HTMLTextAreaElement | null;
    counter.textContent = String(input?.value.length ?? 0);
  });
}

function resetEditor() {
  editorForm.reset();
  byId<HTMLInputElement>('post-id').value = '';
  byId<HTMLInputElement>('post-author').value = 'Equipe Nova Belluno';
  editorTitle.textContent = 'Novo artigo';
  editorState.textContent = 'Rascunho';
  slugWasEdited = false;
  updateCounters();
  titleInput.focus();
}

function fillEditor(post: BlogPostRow) {
  byId<HTMLInputElement>('post-id').value = post.id;
  titleInput.value = post.title;
  slugInput.value = post.slug;
  byId<HTMLTextAreaElement>('post-description').value = post.description;
  byId<HTMLInputElement>('post-author').value = post.author;
  byId<HTMLSelectElement>('post-category').value = post.category;
  byId<HTMLInputElement>('post-tags').value = post.tags.join(', ');
  byId<HTMLTextAreaElement>('post-body').value = post.body_markdown;
  coverImageInput.value = post.cover_image;
  byId<HTMLInputElement>('post-cover-alt').value = post.cover_alt;
  byId<HTMLInputElement>('post-seo-title').value = post.seo_title ?? '';
  byId<HTMLTextAreaElement>('post-seo-description').value = post.seo_description ?? '';
  byId<HTMLSelectElement>('post-status').value = post.status;
  byId<HTMLInputElement>('post-featured').checked = post.featured;
  editorTitle.textContent = 'Editar artigo';
  editorState.textContent = post.status === 'published' ? 'Publicado' : post.status === 'archived' ? 'Arquivado' : 'Rascunho';
  slugWasEdited = true;
  updateCounters();
  editorForm.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function renderPosts() {
  postList.replaceChildren();

  if (!posts.length) {
    const empty = document.createElement('p');
    empty.className = 'admin-posts__empty';
    empty.textContent = 'Nenhum artigo cadastrado no banco.';
    postList.append(empty);
    return;
  }

  posts.forEach((post) => {
    const item = document.createElement('article');
    item.className = 'admin-post-item';

    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = post.title;
    const meta = document.createElement('small');
    meta.textContent = `${post.category} · ${post.status}`;
    copy.append(title, meta);

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Editar';
    edit.addEventListener('click', () => fillEditor(post));
    item.append(copy, edit);

    if (currentRole === 'admin') {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'admin-post-item__delete';
      remove.textContent = 'Excluir';
      remove.addEventListener('click', async () => {
        if (!supabase || !window.confirm(`Excluir definitivamente “${post.title}”?`)) return;
        const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
        if (error) {
          setStatus(`Não foi possível excluir: ${error.message}`, 'error');
          return;
        }
        setStatus('Artigo excluído.', 'success');
        await loadPosts();
        resetEditor();
      });
      item.append(remove);
    }

    postList.append(item);
  });
}

async function loadPosts() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id,slug,title,description,body_markdown,author,category,tags,cover_image,cover_alt,featured,status,seo_title,seo_description,canonical_url,published_at,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    setStatus(`Falha ao carregar artigos: ${error.message}`, 'error');
    return;
  }

  posts = (data ?? []) as BlogPostRow[];
  renderPosts();
}

async function authorize(user: User) {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('role,display_name,is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    await supabase.auth.signOut();
    setStatus('Este usuário não possui autorização editorial ativa.', 'error');
    return false;
  }

  currentUser = user;
  currentRole = data.role as AdminRole;
  loginSection.hidden = true;
  workspace.hidden = false;
  setStatus(`Acesso autorizado para ${data.display_name}.`, 'success');
  await loadPosts();
  return true;
}

async function restoreSession() {
  if (!supabase) return;
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return;

  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) await authorize(data.user);
}

async function uploadCover(file: File, slug: string) {
  if (!supabase) throw new Error('Supabase não configurado.');
  if (file.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.');

  const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const path = `covers/${slug}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('blog-media').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('blog-media').getPublicUrl(path).data.publicUrl;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase) return;

  const email = byId<HTMLInputElement>('admin-email').value.trim();
  const password = byId<HTMLInputElement>('admin-password').value;
  const button = loginForm.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (button) button.disabled = true;
  setStatus('Validando acesso…');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (button) button.disabled = false;

  if (error || !data.user) {
    setStatus('E-mail ou senha inválidos.', 'error');
    return;
  }

  await authorize(data.user);
});

editorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase || !currentUser) return;

  saveButton.disabled = true;
  setStatus('Salvando artigo…');

  try {
    const form = new FormData(editorForm);
    const slug = String(form.get('slug') ?? '').trim();
    const selectedFile = coverFileInput.files?.[0];
    const coverImage = selectedFile ? await uploadCover(selectedFile, slug) : String(form.get('cover_image') ?? '').trim();
    const statusValue = String(form.get('status')) as PostStatus;
    const existing = posts.find((post) => post.id === String(form.get('id')));

    const payload = {
      slug,
      title: String(form.get('title') ?? '').trim(),
      description: String(form.get('description') ?? '').trim(),
      body_markdown: String(form.get('body_markdown') ?? '').trim(),
      author: String(form.get('author') ?? '').trim(),
      category: String(form.get('category')),
      tags: String(form.get('tags') ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
      cover_image: coverImage,
      cover_alt: String(form.get('cover_alt') ?? '').trim(),
      featured: form.get('featured') === 'on',
      status: statusValue,
      seo_title: String(form.get('seo_title') ?? '').trim() || null,
      seo_description: String(form.get('seo_description') ?? '').trim() || null,
      canonical_url: null,
      published_at: statusValue === 'published' ? existing?.published_at ?? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const id = String(form.get('id') ?? '');
    const result = id
      ? await supabase.from('blog_posts').update(payload).eq('id', id).select('id').single()
      : await supabase.from('blog_posts').insert({ ...payload, created_by: currentUser.id }).select('id').single();

    if (result.error) throw result.error;
    coverImageInput.value = coverImage;
    coverFileInput.value = '';
    setStatus(statusValue === 'published' ? 'Artigo publicado com sucesso.' : 'Rascunho salvo com sucesso.', 'success');
    await loadPosts();
    const saved = posts.find((post) => post.id === result.data.id);
    if (saved) fillEditor(saved);
  } catch (error) {
    setStatus(`Não foi possível salvar: ${error instanceof Error ? error.message : 'erro desconhecido'}`, 'error');
  } finally {
    saveButton.disabled = false;
  }
});

slugInput.addEventListener('input', () => { slugWasEdited = true; });
titleInput.addEventListener('input', () => {
  if (!slugWasEdited) slugInput.value = slugify(titleInput.value);
});
editorForm.addEventListener('input', updateCounters);
byId<HTMLButtonElement>('admin-new-post').addEventListener('click', resetEditor);
byId<HTMLButtonElement>('admin-logout').addEventListener('click', async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
  currentUser = null;
  posts = [];
  workspace.hidden = true;
  loginSection.hidden = false;
  loginForm.reset();
  setStatus('Sessão encerrada.');
});

if (!isSupabaseConfigured || !supabase) {
  loginForm.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input,button').forEach((element) => { element.disabled = true; });
  setStatus('Backend preparado. Configure PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_PUBLISHABLE_KEY para ativar o acesso.', 'neutral');
} else {
  restoreSession();
}

updateCounters();
