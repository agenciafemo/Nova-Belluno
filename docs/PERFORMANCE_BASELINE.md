# Linha de base de desempenho

Medição realizada localmente em 24 de agosto de 2026 com Lighthouse em perfil móvel e Chrome headless. Os relatórios completos estão em `docs/baseline-lighthouse.json` e `docs/astro-lighthouse.json`.

## Resultados

| Métrica | Site estático original | Build Astro |
| --- | ---: | ---: |
| Performance | 69 | 70 |
| Acessibilidade | 94 | 94 |
| Boas práticas | 100 | 100 |
| SEO | 100 | 100 |
| FCP simulado | 3,2 s | 2,8 s |
| LCP simulado | 29,3 s | 28,3 s |
| TBT | 0 ms | 0 ms |
| CLS | 0,009 | 0,009 |
| Requisições | 52 | 33 |
| Transferência observada | 5.632.097 bytes | 5.496.619 bytes |

O build reduziu dezenove requisições ao consolidar CSS e JavaScript por rota. A transferência caiu cerca de 135 KB nessa primeira etapa, sem alterar as imagens aprovadas.

## Interpretação do LCP

O LCP simulado permanece ruim porque a dobra inicial reúne múltiplas imagens do slideshow, logos rasterizadas e fontes externas. Sob a simulação de rede do Lighthouse, o conjunto total posterga a estimativa de interatividade e LCP. No navegador local da execução, o LCP observado foi 1.349 ms no original e 1.429 ms no build, diferença compatível com variação entre execuções.

Não se deve apresentar essa medição local como dado de usuário real. Após a publicação, o projeto precisa de dados de campo e uma nova auditoria em rede real.

## Acessibilidade registrada

O resultado de 94 aponta duas pendências herdadas do visual atual: contraste insuficiente em alguns estados e alvos de toque menores ou próximos demais. Elas foram registradas para uma etapa visual própria, porque corrigi-las agora poderia alterar cores e dimensões já aprovadas.

## Próximas otimizações prioritárias

1. Gerar variantes responsivas do hero e impedir que todos os slides sejam baixados na primeira dobra.
2. Converter logos grandes em assets apropriados para cada uso, incluindo favicon dedicado.
3. Hospedar ou ajustar o carregamento das fontes para reduzir dependência externa no caminho crítico.
4. Definir cache imutável para assets versionados e compressão Brotli/Gzip na hospedagem.
5. Revisar os iframes de Maps e o widget do Instagram quando a integração definitiva for escolhida.

Essas ações foram registradas, mas não aplicadas nesta fase para respeitar a exigência de não alterar o comportamento e o visual aprovados.
