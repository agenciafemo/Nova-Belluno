# Checklist de produção

## Conteúdo e confiança

- Confirmar com a Nova Belluno os textos institucionais, horários e serviços oferecidos em cada unidade.
- Tratar Siderópolis como unidade principal e Capivari de Baixo como unidade secundária, sem insinuar estrutura idêntica.
- Não prometer médico 24 horas. Usar “avaliação médica regular”.
- Manter apenas hospedagem temporária e definitiva nas modalidades.
- Revisar telefones, endereços, links dos mapas e e-mail antes de cada publicação importante.

## SEO, respostas de IA e experiência de busca

- Verificar `https://novabelluno.com.br` no Google Search Console e Bing Webmaster Tools.
- Enviar `/sitemap-index.xml` e testar `/robots.txt`.
- Manter os perfis do Google Business atualizados, com uma ficha por unidade e dados consistentes com a página de Contato.
- Solicitar reindexação somente após o domínio de produção servir as URLs canônicas corretas.
- Usar títulos e descrições únicos; responder perguntas reais de familiares no primeiro parágrafo de cada artigo.
- Manter FAQ visível igual aos dados estruturados. Não criar texto oculto apenas para mecanismos de busca.
- Publicar conteúdos assinados, datados e revisados, citando fontes confiáveis quando houver orientação de saúde.
- Monitorar consultas, CTR, páginas indexadas e Core Web Vitals; atualizar artigos que perderem precisão.

## Desempenho e acessibilidade

- Rodar `npm run check` e `npm run build` em todo deploy.
- Medir Lighthouse mobile em produção e registrar LCP, INP e CLS.
- Confirmar cache imutável para `/assets/img/optimized/`, compressão Brotli/Gzip e HTTP/2 ou HTTP/3.
- Testar teclado, foco visível, zoom de 200%, leitor de tela e `prefers-reduced-motion`.
- Validar a home em 360 px, 768 px, 1280 px e telas largas.
- Não adicionar scripts de terceiros sem medir o impacto e obter consentimento quando aplicável.

## Segurança e privacidade

- Aplicar os cabeçalhos de `public/_headers` ou equivalentes no provedor.
- Publicar Política de Privacidade antes de coletar dados pessoais em formulários ou analytics.
- Se Analytics/Meta Pixel forem instalados, implementar consentimento compatível com a LGPD.
- Ativar MFA, backups e monitoramento do Supabase conforme `SUPABASE_CMS_SETUP.md`.
- Nunca incluir service role, senha, token do Instagram ou credenciais no repositório ou em variáveis `PUBLIC_`.

## Instagram

- As seis imagens atuais são recortes de publicações públicas do perfil oficial e cada card leva ao post de origem.
- Atualizar manualmente as imagens e links quando a equipe desejar renovar a vitrine.
- Para atualização automática, usar uma integração server-side com token armazenado como segredo; nunca expor o token no navegador.
- Preservar textos alternativos que descrevam a imagem real, sem inventar pessoas, datas ou serviços.
