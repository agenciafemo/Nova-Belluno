# Inventário e arquitetura — Fases 1 a 4

Data da auditoria: 24 de agosto de 2026.

## Estado encontrado

O projeto era um site estático sem etapa de build e sem gerenciador de dependências. A aplicação era composta por duas páginas HTML, quinze folhas de estilo, nove scripts JavaScript e imagens locais. Não havia backend, autenticação, testes automatizados, pipeline de validação ou separação de configuração pública e privada.

Os arquivos `index.html`, `modalidades.html`, `css/`, `js/` e `assets/` foram mantidos como referência e histórico da migração.

## Páginas e dependências

### Página inicial

Entrada Astro: `src/pages/index.astro`

Estilos carregados:

- reset, variáveis e botões
- hero, header e navegação
- números, modalidades, serviços, quem somos e unidades
- Instagram, rodapé e WhatsApp flutuante

Scripts carregados:

- configuração de WhatsApp e Maps
- estado do header e navegação móvel
- slideshow e texto digitado do hero
- ticker SVG
- contadores
- carrossel de Quem somos
- carrossel de Serviços

### Modalidades

Entrada Astro: `src/pages/modalidades.astro`

Estilos carregados:

- reset, variáveis e botões
- header e navegação
- base de páginas internas
- conteúdo específico de Modalidades
- rodapé e WhatsApp flutuante

Scripts carregados:

- configuração de WhatsApp
- estado do header
- navegação móvel e ano do rodapé

Scripts do hero, ticker e carrosséis não entram nessa rota.

### Serviços

Entrada Astro: `src/pages/servicos.astro`

A rota apresenta as dez áreas de cuidado já aprovadas na home em uma estrutura
editorial própria. Uma grade responsiva mostra todas as áreas com uma explicação
breve, acesso ao respectivo guia e contato de WhatsApp com mensagem específica.
As imagens de serviços não aparecem nessa rota, mas permanecem nos assets porque
continuam sendo usadas pelo carrossel da página inicial. Todo o conteúdo e o FAQ
permanecem legíveis sem JavaScript.

O SEO inclui metadata própria, breadcrumb, uma `ItemList` com os dez serviços e
FAQ estruturado. Modalidades e Serviços compartilham a entrada mínima
`src/scripts/internal.ts`.

### Guias de serviços

Entrada dinâmica: `src/pages/servicos/[slug].astro`

O build gera dez rotas estáticas a partir de `src/data/services.ts`. Cada guia
possui título e descrição próprios, explicação aprofundada, aviso sobre variação
por unidade e necessidade, quatro perguntas frequentes, serviços relacionados e
WhatsApp contextualizado. `WebPage`, `BreadcrumbList` e `FAQPage` são incluídos
no JSON-LD de cada rota.

As descrições evitam promessa médica de disponibilidade integral. A indicação
de presença 24 horas aparece exclusivamente no serviço de técnicos de
enfermagem.

### Quem somos

Entrada Astro: `src/pages/quem-somos.astro`

A rota `/quem-somos/` aprofunda a história apresentada na página inicial com
uma composição editorial estática, quatro princípios de cuidado, informações
transparentes sobre as configurações distintas das duas unidades e um contato
contextual por WhatsApp. A página utiliza somente imagens que já pertenciam ao
projeto e não adiciona outro carrossel ou dependência de JavaScript.

O SEO inclui metadata própria, canonical, `AboutPage` e `BreadcrumbList`. A
navegação compartilhada aponta diretamente para a nova rota e a seção resumida
da home ganhou um CTA sem perder o carrossel existente.

## Componentes compartilhados

- `BaseLayout.astro`: documento HTML, idioma, estrutura comum e slots de conteúdo.
- `SEOHead.astro`: metadata, canonical, Open Graph, Twitter Cards e JSON-LD.
- `Header.astro`: navegação desktop/móvel e variações para página inicial e interna.
- `Footer.astro`: marca, atalhos, contatos e crédito opcional.
- `FloatingWhatsApp.astro`: contato flutuante comum às páginas.
- `ServiceCard.astro`: resumo, guia e WhatsApp contextual de cada serviço.
- `FAQ.astro`: acordeão sem dependência de JavaScript, reutilizado nas rotas de serviços.
- `WhatsAppIcon.astro`: ícone compartilhado pelos contatos contextuais.

## Estratégia de preservação visual

A marcação central aprovada foi copiada sem reescrita visual para `src/content/`. O Astro injeta esses fragmentos dentro do layout compartilhado. Essa decisão reduz o risco de regressões enquanto permite evoluir gradualmente cada seção para componentes próprios nas próximas fases.

Os CSS existentes continuam como fonte de verdade. `src/styles/` apenas define quais arquivos pertencem a cada rota, e o Astro consolida e versiona os bundles no build.

Os scripts existentes continuam com a mesma lógica. `src/scripts/` cria entradas separadas para impedir que páginas internas carreguem animações exclusivas da página inicial.

## Assets

O diretório original de assets possui 58 arquivos e cerca de 44 MB, incluindo PNGs de produção e originais pesados. `public/assets/` contém somente os 32 arquivos utilizados pelas páginas atuais, cerca de 5,7 MB antes da transferência e compressão do servidor. Os originais permanecem intactos fora do pacote publicado.

## Rotas e compatibilidade

A URL canônica de Modalidades é `/modalidades/`. O arquivo estático `/modalidades.html` permanece como redirecionamento de compatibilidade, com `noindex, follow` e canonical para a rota definitiva.

A seção canônica de entrada dos Serviços fica na home em `/#servicos`. A rota
legada `/servicos/` apenas redireciona para esse ponto; as páginas individuais
em `/servicos/[slug]/` continuam canônicas e integram o sitemap.

## Limites e responsabilidades de produção

- O CMS está pronto, mas requer conexão ao projeto Supabase e cadastro do primeiro administrador.
- O blog público é gerado estaticamente; um rebuild deve ser disparado após publicar no CMS.
- Contato e Blog possuem páginas próprias; horários, telefones e serviços devem ser confirmados pelo cliente.
- O WhatsApp central usa o número confirmado da unidade principal de Siderópolis; os cartões de unidade mantêm seus números específicos.
- A marcação central ainda é HTML preservado; poderá ser componentizada por seção quando o CMS e o modelo de conteúdo estiverem definidos.

## Próxima fronteira arquitetural

A próxima fase deve definir o modelo de conteúdo e as rotas antes de introduzir o backend. Credenciais administrativas, chaves privadas e operações privilegiadas deverão permanecer exclusivamente no servidor. Apenas dados explicitamente públicos poderão ser serializados para o navegador.
