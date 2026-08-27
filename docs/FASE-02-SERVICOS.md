# Prompt — Fase 2: página dedicada de Serviços

Trabalhe no projeto Astro da Nova Belluno em `C:\Users\user\Desktop\SITES\NOVA.BELLUNO`.

## Objetivo

Criar a rota pública `/servicos/` e transformar o conteúdo já aprovado na página inicial em uma página própria, clara, responsiva e preparada para SEO. Esta fase não inclui blog, painel administrativo, banco de dados ou autenticação.

## Implementação

1. Reaproveite os dez serviços e seus textos já presentes no carrossel da home, sem criar promessas novas:
   - avaliação médica regular;
   - enfermeiro-chefe;
   - técnicos de enfermagem 24h;
   - nutrição;
   - recreação;
   - psicologia;
   - fonoaudiologia;
   - fisioterapia;
   - educação física;
   - atividades musicais.
2. Reaproveite as duas imagens existentes de cada serviço em `public/assets/img/services/`.
3. Crie uma apresentação editorial estática, acessível e confortável de ler. Não replique o carrossel da home: na página dedicada, todos os serviços devem ser encontráveis e legíveis sem depender de JavaScript.
4. Inclua uma observação transparente de que a composição dos atendimentos e atividades pode variar conforme a unidade e as necessidades do residente.
5. Use somente os tokens de cor, tipografia, raio e sombra já definidos no projeto.
6. Mantenha o padrão compartilhado de header, footer, WhatsApp e botões.
7. Atualize os links “Serviços” da navegação compartilhada para `/servicos/` e marque a rota ativa com `aria-current="page"`.
8. Corrija links relativos antigos da página de Modalidades para URLs absolutas internas.
9. Configure título, description, canonical, Open Graph e dados estruturados `WebPage`, `BreadcrumbList` e `ItemList`.

## Restrições de conteúdo

- Nunca afirmar médico disponível 24 horas. Use apenas “avaliação médica regular” ou equivalente.
- “24h” refere-se somente aos técnicos de enfermagem.
- Não inventar frequência, procedimento, certificação, número de profissionais ou disponibilidade igual nas duas unidades.
- Não alterar visual ou comportamento da home, do hero, do ticker e dos carrosséis existentes, além do destino compartilhado do link “Serviços”.

## Validação

- `/servicos/` abre diretamente e aparece no sitemap.
- Os dez serviços e as vinte imagens estão presentes.
- A página funciona sem JavaScript para leitura do conteúdo.
- Navegação por teclado, hierarquia de títulos e textos alternativos estão corretos.
- Layout sem overflow em desktop e mobile.
- `npm run check` e `npm run build` passam sem erros.
- Nenhum link interno gerado aponta para uma rota inexistente.
