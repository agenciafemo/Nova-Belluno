# Nova Belluno

Site institucional da Nova Belluno em Astro, com geração estática, TypeScript em modo estrito e CMS editorial protegido por Supabase. A arquitetura combina páginas rápidas e indexáveis com uma área administrativa para o blog.

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior

As versões das dependências estão fixadas em `package.json` e reproduzidas por `package-lock.json`.

## Comandos

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

- Desenvolvimento: `http://localhost:4321/`
- Modalidades no desenvolvimento: `http://localhost:4321/modalidades/`
- Serviços na home: `http://localhost:4321/#servicos`
- Quem somos no desenvolvimento: `http://localhost:4321/quem-somos/`
- Para famílias no desenvolvimento: `http://localhost:4321/familias/`
- Contato no desenvolvimento: `http://localhost:4321/contato/`
- Blog no desenvolvimento: `http://localhost:4321/blog/`
- Administração do blog: `http://localhost:4321/admin/`
- Exemplo de guia de serviço: `http://localhost:4321/servicos/fonoaudiologia/`
- Saída estática: `dist/`

## Rotas atuais

| Rota | Origem | Situação |
| --- | --- | --- |
| `/` | antiga `index.html` | migrada e validada |
| `/modalidades/` | antiga `modalidades.html` | migrada e validada |
| `/servicos/` | compatibilidade legada | redireciona para `/#servicos` |
| `/quem-somos/` | história e princípios apresentados na home | criada e validada |
| `/familias/` | conteúdo para filhos e familiares, depoimento e FAQ | criada e validada |
| `/contato/` | unidades, endereços, mapas e canais | criada e validada |
| `/blog/` | coleção editorial estática | criada e validada |
| `/admin/` | Supabase Auth + editor protegido por RLS | criada; requer conexão ao projeto Supabase |
| `/servicos/[slug]/` | dados centralizados em `src/data/services.ts` | 10 guias estáticos criados |
| `/modalidades.html` | compatibilidade legada | redireciona no build estático |

## Estrutura

```text
src/
  components/       componentes compartilhados do site
  content/          marcação preservada das páginas atuais
  data/             conteúdo estruturado dos serviços
  layouts/          estrutura HTML e SEO compartilhados
  pages/            rotas Astro
  scripts/          entradas JavaScript por página
  styles/           entradas CSS por página
public/
  assets/            somente imagens usadas em produção
  robots.txt
css/                 estilos legados preservados durante a migração
js/                  comportamentos legados preservados durante a migração
docs/                inventário e medições da fase
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha a URL e a publishable key do projeto Supabase. Apenas variáveis prefixadas com `PUBLIC_` chegam ao navegador. A service role é segredo de servidor/CI e nunca pode ser importada por componentes ou scripts do cliente.

O esquema declarativo, as políticas RLS, o bucket de mídia, o painel editorial e a sincronização do blog estão implementados. A ativação no projeto real exige aplicar o esquema e cadastrar o primeiro administrador conforme [docs/SUPABASE_CMS_SETUP.md](docs/SUPABASE_CMS_SETUP.md).

## SEO e publicação

- HTML estático por rota
- títulos e descrições únicos
- canonical, robots, Open Graph e Twitter Cards
- JSON-LD por página
- FAQ estruturado na seção de Serviços da home e nos dez guias
- FAQ visível e estruturado na página inicial
- dados estruturados de organização, unidades locais e artigos
- RSS em `/rss.xml`
- `robots.txt`
- sitemap gerado no build
- rota legada de Modalidades mantida para não perder links existentes

O domínio de produção configurado é `https://novabelluno.com.br`.

## Antes de publicar

1. Ativar o Supabase seguindo o guia de configuração.
2. Executar `npm run check` e `npm run build`.
3. Testar o conteúdo de `dist/` com `npm run preview`.
4. Configurar o rebuild automático após publicação no CMS.
5. Concluir a lista de produção em [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md).

Consulte também [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e [docs/PERFORMANCE_BASELINE.md](docs/PERFORMANCE_BASELINE.md).
