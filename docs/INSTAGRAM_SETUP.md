# Grid do Instagram

O grid da página inicial é gerado no build a partir das publicações reais de
`@novabelluno`. A estratégia é a mesma do blog: um script busca o conteúdo
externo antes do Astro iniciar, grava arquivos locais e o site continua
totalmente estático.

## Por que as imagens são baixadas

As URLs devolvidas pela Graph API (`media_url`, `thumbnail_url`,
`profile_picture_url`) são assinadas pelo CDN do Instagram e expiram em poucas
horas. Guardar a URL no HTML faria o grid quebrar sozinho. O script baixa cada
imagem para `src/assets/instagram/` e o pipeline de imagens do Astro gera as
variantes WebP do `srcset`.

## Configuração no Meta Developers

1. A conta `@novabelluno` precisa ser Profissional (Business ou Criador).
2. No app, use o caso de uso **Gerenciar mensagens e conteúdo no Instagram**.
3. Em permissões, mantenha apenas **`instagram_business_basic`** com acesso
   padrão. Mensagens e comentários são dados sensíveis, exigem Análise do App
   e não são usados pelo site.
4. Em **Funções do app**, adicione `novabelluno` como **Testador do Instagram**
   e aceite o convite em <https://www.instagram.com/accounts/manage_access/>.
5. Em **Configurações** do caso de uso, conecte a conta e clique em
   **Gerar token**. O valor aparece uma única vez.

O app pode permanecer em modo de desenvolvimento e não publicado: o acesso
padrão a `instagram_business_basic` cobre a leitura da própria conta. Análise
do App só seria necessária para ler contas de terceiros.

## Variáveis de ambiente

Preencha no `.env` local e no provedor de hospedagem:

```bash
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_ACCESS_TOKEN=
```

Nenhuma usa o prefixo `PUBLIC_`. O token concede leitura da conta da empresa e
é usado somente no Node, durante o build.

## Comandos

```bash
npm run sync:instagram     # busca as publicações e regrava src/assets/instagram/
npm run instagram:refresh  # renova o token de 60 dias e imprime o novo valor
npm run build              # executa a sincronização automaticamente no prebuild
```

Sem `INSTAGRAM_ACCESS_TOKEN`, `sync:instagram` encerra sem erro e o build usa o
conjunto editorial versionado em `src/data/instagram.json`. Isso mantém o site
publicável em qualquer máquina e no CI sem segredos.

## Renovação do token

O token de longa duração vale **60 dias** e só pode ser renovado após 24 horas
de vida. `npm run instagram:refresh` devolve um token novo, que precisa ser
colado no `.env` e nas variáveis do provedor.

Esse passo ainda é manual porque variáveis de ambiente de CI não são graváveis
pelo próprio build. A automação natural, quando fizer sentido, é guardar o
token numa tabela privada do Supabase acessível apenas pela `service_role`:
o script leria o valor, renovaria quando faltassem menos de dez dias e gravaria
de volta, eliminando a manutenção manual.

**Enquanto isso não existir, agende um lembrete a cada 45 dias.** Um token
expirado faz o build falhar com mensagem explícita — o site publicado continua
no ar com o grid anterior, mas deixa de atualizar.

## Atualização automática

O site é estático: uma publicação nova só aparece depois de um rebuild. Configure
no provedor de hospedagem um build agendado (diário costuma ser suficiente para
um perfil institucional) além do deploy hook que o CMS do blog já utiliza.

## Texto alternativo

A Graph API não fornece texto alternativo. O script deriva a descrição da
primeira linha da legenda, sem hashtags, menções e links. É uma aproximação
inferior às descrições redigidas à mão que existiam antes.

Se a acessibilidade do grid for prioridade, escreva legendas cujo primeiro
parágrafo descreva a cena — isso melhora o alt automaticamente e não exige
nenhuma mudança de código.

## Limites

- Apenas as seis publicações mais recentes entram no grid.
- Reels usam a miniatura; carrosséis usam a primeira imagem.
- Stories não são expostos por esta API.
