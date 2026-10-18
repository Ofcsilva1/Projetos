# Fase 3 — indicadores e visualizações analíticas

Implementada a partir da `main` que recebeu a PR da Fase 2, em branch própria. Escopo autorizado: cálculos e análises sustentados pela base disponível, mantendo a interface aprovada, atualizando o cartão do portfólio e entregando uma nova pull request sem merge automático.

## Fontes e preservação

- `data.js`: 100 registros fictícios, 26 campos. Conteúdo preservado integralmente; nenhum valor foi corrigido, preenchido ou substituído nesta etapa.
- Grão: um registro por pessoa na amostra preparada. Identificadores individuais não estão disponíveis para certificar unicidade por pessoa.
- 91 ativos e 9 desligados. A ausência de competência mensal e de quadro histórico completo permanece visível.
- As 90 avaliações de desempenho ausentes não foram convertidas em notas nem usadas para criar indicadores.

## Regras compartilhadas

`metrics.js` é a única camada de agregação numérica. `analytics.js` apresenta as novas métricas; cartões, resumos e tabela também usam essa camada.

- **Valor válido:** número finito e não negativo. Zero é válido; `null`, campos ausentes, texto, número negativo, NaN e infinito são indisponíveis. A ingestão continua separada: textos numéricos não são convertidos silenciosamente pelo cálculo.
- **Soma:** somar somente os valores válidos. Em população não vazia sem valores válidos, retornar indisponível. Sem registros elegíveis, retornar zero para uma soma; média, mediana e taxa permanecem indisponíveis.
- **Média:** soma válida / quantidade válida. Agregar o recorte inteiro, sem média simples de médias de departamentos.
- **Mediana:** ordenar cópia dos valores válidos. Com n ímpar, valor central; com n par, média dos dois centrais. Não modificar a ordem da fonte.
- **Taxa:** numerador válido / denominador válido positivo × 100. Denominador zero ou ausente resulta em indisponível.
- **Categorias ausentes:** grupo “Não informado”, preservando a contagem da composição.
- **Apresentação:** indisponível é “—”; zero observado é zero. Arredondamento somente na apresentação e na exportação, sem arredondamento intermediário nas métricas.

## Definições dos indicadores

- **Ativos:** registros com `Status = Ativo` no recorte atual.
- **Folha base mensal:** soma de `Salario_Base` válido somente dos ativos. Sem encargos, benefícios, bônus ou custo de horas extras.
- **Salário médio:** folha base informada / número de salários válidos dos ativos.
- **Mediana salarial:** mediana de `Salario_Base` válido dos ativos.
- **Bônus anual:** soma de `Bonus_Anual_RS` válido dos ativos. Competência anual desconhecida; não adicionar à folha mensal.
- **Meta alcançada:** número de metas válidas ≥ 100 / número de metas válidas × 100. O panorama conta as metas abaixo de 100 somente entre registros válidos e explicita as ausências.
- **Meta média:** média dos percentuais individuais válidos, sem ponderação por valores financeiros de metas, que não constam na fonte.
- **Horas extras:** total e média de `Horas_Extra_Mes` válido. A competência do mês permanece desconhecida.
- **Idade média:** média da idade válida registrada. Sem atualização pelo calendário.
- **Ocorrências por 100 com informação:** soma de `Acidentes_Trabalho` válido / registros com informação válida de acidentes × 100. Não é percentual de acidentados e pode ultrapassar 100. Os zeros são observações válidas.
- **Pessoas com ocorrência:** registros com acidentes válidos > 0. O donut agora separa “Sem informação” de “Sem ocorrência”.
- **Bolhas de metas e horas:** manter somente registros com ambos os valores válidos; médias e área usam essa mesma população de pares observados.
- **Senioridade:** contagem de `Nivel_Cargo` registrado; não inferir por idade ou tempo de empresa.
- **Distribuição por cargo:** contagem por `Cargo`, com os 12 maiores grupos no gráfico; todos permanecem na tabela.
- **Histórico:** admissões e saídas por ano com datas ISO válidas. Posição em 31/12: admissão até o corte e saída após o corte; quem sai em 31/12 já está fora. Data de saída anterior à admissão não entra em saídas válidas ou quadro reconstruído. Uma admissão válida ainda pode ser contada independentemente. O histórico cobre apenas a amostra, com atributos e status atuais dos filtros.

## Visualizações e exportação

- Remuneração dos ativos na seção Desempenho & custos: média, mediana e bônus separados, com n válido.
- Barras pareadas de média e mediana por departamento e cargo, ordenadas pela média. Mesmo zero de origem e escala comum entre as duas séries dentro de cada painel. As escalas dos dois painéis são independentes; comparar departamentos ou cargos dentro de seu próprio painel. Até 12 cargos no gráfico.
- Cada grupo informa salários válidos / ativos. Sem salário conhecido, mostrar indisponível e não desenhar barra zero.
- Nenhum comparativo é ajustado por cargo, nível ou jornada; não permite concluir equidade ou discriminação salarial.
- Senioridade e composição por cargo na seção Pessoas & diversidade.
- CSV com 16 colunas: os campos existentes mais média, mediana e n válido de salário, meta, acidentes, idade e horas extras. O cabeçalho da taxa de ocorrências foi explicitado. Campos indisponíveis ficam vazios; números têm até duas casas, separador decimal vírgula e delimitador ponto e vírgula. Busca, agrupamento e ordenação continuam respeitados.

## Reconciliação da base completa

- Ativos: 91; desligados: 9; salários ativos válidos: 91.
- Folha: R$ 1.004.900; salário médio: 1.004.900 / 91 = R$ 11.042,86 na apresentação.
- Mediana dos 91 salários ativos: R$ 10.800,00.
- Bônus anual dos ativos: R$ 1.579.100, separado da folha mensal.
- Metas válidas: 100; pessoas com meta ≥ 100: 64; participação: 64,0%.
- Horas extras: 1.061; acidentes: 6; idade média: 33,15 anos, exibida com uma casa nos KPIs.
- Histórico reconciliado: 100 admissões e 9 saídas; última posição reconstruída da amostra: 91 pessoas.
- Tecnologia: 15 salários ativos, folha R$ 163.700, média R$ 10.913,33 e mediana R$ 11.800,00.

## Testes executados em 18/10/2026

- **21 testes unitários de cálculo**, versionados em `tests/metrics.test.cjs`: nulos, texto numérico rejeitado, zero, negativos, infinitos, mediana par/ímpar, agregação ponderada pelo número de pessoas, denominador zero, população sem ativos, soma indisponível, categorias especiais, calendário e limites de 31/12, histórico com um ano e reconciliação dos dados.
- **90 checks de regressão** da Fase 2 com Playwright/Chrome: filtros, seções, tabela, CSV, temas, teclado, menu, resumo fixo, movimento reduzido e sete larguras de 320 a 1920 px.
- **48 checks específicos da Fase 3**: salário médio e mediana gerais e de Tecnologia, dois comparativos, grupos sem ativos, senioridade totalizando 100, cargo, tooltip por teclado, metodologia, overflow em 390/320 px e testes com nulos em sessão isolada.
- Fixture de quatro registros: meta 2/3 = 66,7% em KPI e resumo; apenas uma meta abaixo de 100 e uma ausência; salários ativos 100 e 300 geram média/mediana 200; grupo com salário desconhecido não recebe barra; CSV tem campos vazios e n salarial zero; taxa de acidentes usa três registros válidos. A fonte original foi restaurada no fim da sessão e não foi editada.
- Recorte com todas as medidas ausentes: sem NaN/Infinity nas seis seções, sem falsas barras salariais e sem bolhas inventadas.
- Capturas desktop/celular revisadas; nenhuma ocorrência de erro JavaScript. Ferramentas e evidências de Playwright ficam fora do checkout, em `rh-solutions-fase2-qa/phase3-evidence`.
- Execute os testes de cálculo com `npm test` na pasta `rh-solutionsx` (Node 18+, sem dependências externas). O navegador continua abrindo o HTML sem instalação.

## Skills e limites

`executive-dashboard-builder`: definições, denominadores e reconciliação. `frontend-design`: integração das análises ao sistema visual existente. `frontend-testing-debugging` e `playwright`: regressão, casos ausentes e revisão de capturas. Não foi adicionado React, biblioteca de gráficos ou dependência em runtime. O script usa Playwright regular já instalado na pasta local de QA, fora do dashboard; o Browser plugin com Skill própria não está disponível nesta sessão.

Turnover, evolução mensal de folha/metas/horas, variações entre competências, tempo de empresa e taxas de acidente por horas de exposição seguem como melhorias futuras. Novos filtros por período/cargo, seleção cruzada e persistência de filtros na URL pertencem à Fase 4, ainda não implementada. Leitor de tela, Firefox, Safari e impressão não foram auditados integralmente nesta fase.
