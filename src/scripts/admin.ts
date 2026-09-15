import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase-browser';
import { getEditorialFeedback } from '../lib/editorial.mjs';

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
const bodyInput = byId<HTMLTextAreaElement>('post-body');
const markdownToolbar = byId<HTMLDivElement>('admin-format-toolbar');
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

function notifyBodyChange(selectionStart: number, selectionEnd = selectionStart) {
  bodyInput.focus();
  bodyInput.setSelectionRange(selectionStart, selectionEnd);
  bodyInput.dispatchEvent(new Event('input', { bubbles: true }));
}

function wrapBodySelection(open: string, close: string, placeholder: string) {
  const start = bodyInput.selectionStart;
  const end = bodyInput.selectionEnd;
  const selected = bodyInput.value.slice(start, end) || placeholder;
  bodyInput.setRangeText(`${open}${selected}${close}`, start, end, 'end');
  notifyBodyChange(start + open.length, start + open.length + selected.length);
}

function insertBodyBlock(
  formatLine: (line: string, index: number) => string,
  placeholder: string,
) {
  const start = bodyInput.selectionStart;
  const end = bodyInput.selectionEnd;
  const selected = bodyInput.value.slice(start, end) || placeholder;
  const leadingBreak = start > 0 && bodyInput.value[start - 1] !== '\n' ? '\n' : '';
  const trailingBreak = end < bodyInput.value.length && bodyInput.value[end] !== '\n' ? '\n' : '';
  const formatted = selected.split('\n').map(formatLine).join('\n');
  const replacement = `${leadingBreak}${formatted}${trailingBreak}`;
  bodyInput.setRangeText(replacement, start, end, 'end');
  const selectionStart = start + leadingBreak.length;
  notifyBodyChange(selectionStart, selectionStart + formatted.length);
}

function insertLink() {
  const start = bodyInput.selectionStart;
  const end = bodyInput.selectionEnd;
  const selected = bodyInput.value.slice(start, end) || 'texto do link';
  const replacement = `[${selected}](https://)`;
  bodyInput.setRangeText(replacement, start, end, 'end');
  if (start === end) {
    notifyBodyChange(start + 1, start + 1 + selected.length);
    return;
  }
  const cursor = start + replacement.length - 1;
  notifyBodyChange(cursor);
}

function applyMarkdownAction(action: string) {
  switch (action) {
    case 'article-title':
      titleInput.focus();
      titleInput.select();
      break;
    case 'heading-2':
      insertBodyBlock((line) => `## ${line.replace(/^#{1,6}\s+/, '')}`, 'Novo subtítulo');
      break;
    case 'heading-3':
      insertBodyBlock((line) => `### ${line.replace(/^#{1,6}\s+/, '')}`, 'Novo subtítulo');
      break;
    case 'bold':
      wrapBodySelection('**', '**', 'texto em negrito');
      break;
    case 'italic':
      wrapBodySelection('_', '_', 'texto em itálico');
      break;
    case 'link':
      insertLink();
      break;
    case 'quote':
      insertBodyBlock((line) => `> ${line.replace(/^>\s?/, '')}`, 'Texto da citação');
      break;
    case 'bullet-list':
      insertBodyBlock((line) => `- ${line.replace(/^[-*+]\s+/, '')}`, 'Item da lista');
      break;
    case 'numbered-list':
      insertBodyBlock((line, index) => `${index + 1}. ${line.replace(/^\d+[.)]\s+/, '')}`, 'Item da lista');
      break;
  }
}

function updateCounters() {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((counter) => {
    const input = document.getElementById(counter.dataset.counter ?? '') as HTMLInputElement | HTMLTextAreaElement | null;
    counter.textContent = String(input?.value.length ?? 0);
  });
  updateEditorialPreview();
}

function readEditorialInput() {
  return {
    title: titleInput.value.trim(),
    slug: slugInput.value.trim(),
    description: byId<HTMLTextAreaElement>('post-description').value.trim(),
    body: byId<HTMLTextAreaElement>('post-body').value.trim(),
    author: byId<HTMLInputElement>('post-author').value.trim(),
    coverImage: coverFileInput.files?.length ? '/pending-upload.webp' : coverImageInput.value.trim(),
    coverAlt: byId<HTMLInputElement>('post-cover-alt').value.trim(),
    seoTitle: byId<HTMLInputElement>('post-seo-title').value.trim(),
    seoDescription: byId<HTMLTextAreaElement>('post-seo-description').value.trim(),
    canonicalUrl: byId<HTMLInputElement>('post-canonical').value.trim(),
    publishing: byId<HTMLSelectElement>('post-status').value === 'published',
  };
}

function updateEditorialPreview() {
  const feedback = getEditorialFeedback(readEditorialInput());
  byId<HTMLElement>('seo-preview-title').textContent = feedback.title || 'Título do artigo';
  byId<HTMLElement>('seo-preview-url').textContent = `https://novabelluno.com.br/blog/${slugInput.value || 'url-do-artigo'}/`;
  byId<HTMLElement>('seo-preview-description').textContent = feedback.description || 'A descrição SEO ou o resumo aparecerá aqui.';
  const checklist = byId<HTMLUListElement>('editorial-checklist');
  checklist.replaceChildren();
  for (const message of [...feedback.errors, ...feedback.warnings]) {
    const item = document.createElement('li');
    item.textContent = message;
    checklist.append(item);
  }
}

function resetEditor() {
  editorForm.reset();
  byId<HTMLInputElement>('post-id').value = '';
  byId<HTMLInputElement>('post-author').value = 'Equipe Nova Belluno';
  editorTitle.textContent = 'Novo artigo';
  editorState.textContent = 'Rascunho';
  slugWasEdited = false;
  slugInput.readOnly = false;
  coverImageInput.required = true;
  updateCounters();
  titleInput.focus();
}

function fillEditor(post: BlogPostRow) {
  byId<HTMLInputElement>('post-id').value = post.id;
  titleInput.value = post.title;
  slugInput.value = post.slug;
  slugInput.readOnly = Boolean(post.published_at);
  coverFileInput.value = '';
  coverImageInput.required = true;
  byId<HTMLTextAreaElement>('post-description').value = post.description;
  byId<HTMLInputElement>('post-author').value = post.author;
  byId<HTMLSelectElement>('post-category').value = post.category;
  byId<HTMLInputElement>('post-tags').value = post.tags.join(', ');
  byId<HTMLTextAreaElement>('post-body').value = post.body_markdown;
  coverImageInput.value = post.cover_image;
  byId<HTMLInputElement>('post-cover-alt').value = post.cover_alt;
  byId<HTMLInputElement>('post-seo-title').value = post.seo_title ?? '';
  byId<HTMLTextAreaElement>('post-seo-description').value = post.seo_description ?? '';
  byId<HTMLInputElement>('post-canonical').value = post.canonical_url ?? '';
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
        setStatus('Artigo excluído do banco. A remoção do site acontecerá após a próxima publicação do site.', 'success');
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

const COVER_WIDTH = 1536;
const COVER_HEIGHT = 1024;
const MAX_SOURCE_IMAGE_SIZE = 12 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

async function optimizeCover(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Use uma imagem JPG, PNG, WebP ou AVIF.');
  }
  if (file.size > MAX_SOURCE_IMAGE_SIZE) {
    throw new Error('A imagem original deve ter no máximo 12 MB.');
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    if (bitmap.width < 1200 || bitmap.height < 800) {
      throw new Error('Para manter a qualidade, use uma imagem com pelo menos 1200 × 800 px.');
    }

    const targetRatio = COVER_WIDTH / COVER_HEIGHT;
    const sourceRatio = bitmap.width / bitmap.height;
    const sourceWidth = sourceRatio > targetRatio ? bitmap.height * targetRatio : bitmap.width;
    const sourceHeight = sourceRatio > targetRatio ? bitmap.height : bitmap.width / targetRatio;
    const sourceX = (bitmap.width - sourceWidth) / 2;
    const sourceY = (bitmap.height - sourceHeight) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = COVER_WIDTH;
    canvas.height = COVER_HEIGHT;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('O navegador não conseguiu preparar a imagem.');

    context.drawImage(
      bitmap,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      COVER_WIDTH,
      COVER_HEIGHT,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error('Não foi possível otimizar a imagem.')),
        'image/webp',
        0.82,
      );
    });
    return blob;
  } finally {
    bitmap.close();
  }
}

async function uploadCover(file: File, slug: string) {
  if (!supabase) throw new Error('Supabase não configurado.');
  setStatus('Otimizando a imagem de capa…');
  const optimizedFile = await optimizeCover(file);

  const path = `covers/${slug}-${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from('blog-media').upload(path, optimizedFile, {
    cacheControl: '31536000',
    contentType: 'image/webp',
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
    setStatus('Não foi possível entrar. Confira a senha e tente novamente.', 'error');
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
    const feedback = getEditorialFeedback(readEditorialInput());
    if (feedback.errors.length) throw new Error(feedback.errors.join(' '));
    const slug = String(form.get('slug') ?? '').trim();
    const existing = posts.find((post) => post.id === String(form.get('id')));
    if (existing?.published_at && existing.slug !== slug) {
      throw new Error('A URL de um artigo já publicado não pode ser alterada pelo painel. Solicite um redirecionamento à equipe técnica.');
    }
    const selectedFile = coverFileInput.files?.[0];
    const coverImage = selectedFile ? await uploadCover(selectedFile, slug) : String(form.get('cover_image') ?? '').trim();
    const statusValue = String(form.get('status')) as PostStatus;

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
      canonical_url: String(form.get('canonical_url') ?? '').trim() || null,
      published_at: existing?.published_at ?? (statusValue === 'published' ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    };

    const id = String(form.get('id') ?? '');
    const result = id
      ? await supabase.from('blog_posts').update(payload).eq('id', id).select('id').single()
      : await supabase.from('blog_posts').insert({ ...payload, created_by: currentUser.id }).select('id').single();

    if (result.error) throw result.error;
    coverImageInput.value = coverImage;
    coverFileInput.value = '';
    setStatus(statusValue === 'published'
      ? 'Artigo salvo como publicado no banco. Ficará disponível após a próxima publicação do site.'
      : 'Alteração salva no banco. Se o artigo estava no site, a retirada acontecerá após a próxima publicação do site.', 'success');
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
markdownToolbar.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-markdown-action]');
  if (button) applyMarkdownAction(button.dataset.markdownAction ?? '');
});
bodyInput.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const shortcuts: Record<string, string> = { b: 'bold', i: 'italic', k: 'link' };
  const action = shortcuts[event.key.toLowerCase()];
  if (!action) return;
  event.preventDefault();
  applyMarkdownAction(action);
});
editorForm.addEventListener('input', updateCounters);
coverFileInput.addEventListener('change', () => {
  coverImageInput.required = !coverFileInput.files?.length;
  updateCounters();
});
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

const adminEmail = byId<HTMLInputElement>('admin-email').value.trim();

if (!isSupabaseConfigured || !supabase || !adminEmail) {
  loginForm.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input,button').forEach((element) => { element.disabled = true; });
  setStatus('Backend preparado. Configure as variáveis públicas do Supabase e o e-mail administrativo para ativar o acesso.', 'neutral');
} else {
  restoreSession();
}

updateCounters();
