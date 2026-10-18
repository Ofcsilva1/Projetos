# RH SolutionsX — People & Diversity Analytics

Dashboard interativo de portfólio em HTML, CSS e JavaScript, com dados fictícios de 100 registros. Sem instalação, build, bibliotecas externas ou conexão com serviços.

## Abrir

Abra `index.html` em um navegador moderno. Mantenha todos os arquivos `.js`, `.css` e a pasta `assets` junto do HTML.

## Publicar no GitHub Pages

1. Neste repositório, mantenha **a pasta `rh-solutionsx` e todos os seus arquivos no local atual**. A raiz contém a vitrine do portfólio; o dashboard será acessível pelo caminho `rh-solutionsx/`. Para publicar em um repositório independente, o conteúdo da pasta pode ocupar a raiz desse outro repositório.
2. No repositório, acesse **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch que contém os arquivos (por exemplo, `main`) e a pasta **/(root)**. Salve.
5. Aguarde a publicação e consulte o endereço mostrado pelo GitHub Pages.

Referência: [Documentação oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Fase 3 — indicadores e visualizações analíticas

`metrics.js` reúne os cálculos puros usados por cartões, gráficos, textos, tabela e CSV. Valores ausentes não viram zero: médias, medianas e taxas usam somente números finitos e não negativos. Os indicadores informam os denominadores válidos; a distribuição de metas e o panorama separam os registros sem informação.

A seção Desempenho & custos apresenta salário médio e mediana salarial dos ativos, além de comparativos por departamento e cargo. A seção Pessoas & diversidade acrescenta senioridade e distribuição por cargo. Na base completa, a média salarial é R$ 11.042,86 e a mediana é R$ 10.800,00, sobre 91 salários ativos válidos. Salário base mensal e bônus anual permanecem separados. Não há ajuste por cargo, nível ou jornada nem inferência de equidade salarial.

`analytics.js` contém a apresentação dessas novas análises e a explicação das fórmulas na aba Metodologia. A tabela e o CSV ganharam média, mediana e colunas de contagem válida para salários, metas, acidentes, idades e horas extras. Os campos numéricos indisponíveis são exportados vazios; o CSV agora possui 16 colunas. O cabeçalho de ocorrências explicita o denominador com informação válida.

O arquivo `data.js` foi preservado integralmente. Turnover, evolução mensal de folha e tempo de empresa continuam pendentes dos dados necessários. Não foram acrescentados filtros ou seleção cruzada da Fase 4. Decisões e definições: [FASE-3.md](FASE-3.md).

### Testes de cálculo

Com Node.js 18 ou superior, executar `npm test` dentro de `rh-solutionsx`, ou `node --test rh-solutionsx/tests/metrics.test.cjs` a partir da raiz do repositório. Os testes usam somente módulos nativos do Node; não exigem instalação de pacotes. Abrir o dashboard continua sem depender de Node, npm ou build.

## Fase 2 — arquitetura visual e design system

O histórico de quadro no fim do ano usa um gráfico de área com degradê, curva suave e rótulos de dados nos pontos anuais. A suavização é apenas visual: os valores representam posições anuais reconstruídas. A opção de admissões e desligamentos mantém duas séries com rótulos separados para cada ano.

Os estilos ativos estão centralizados em `premium.css`, com tokens de cores, superfícies, espaçamento, bordas e foco para os dois temas. `styles.css`, `refinement.css` e `finishing.css` foram preservados como referência da versão anterior, mas não são carregados pelo HTML atual.

Modo claro e modo escuro disponíveis no topo. Na primeira visita, o tema acompanha a preferência do sistema; a escolha manual fica salva no navegador. A navegação lateral reúne as seis seções no desktop. Até 900 px, um botão abre a navegação; Escape fecha o menu e devolve o foco ao botão. Selecionar uma seção fecha o menu e leva o foco ao conteúdo.

A visão geral preserva dez visualizações e cinco cartões. A ordem de leitura começa pelos KPIs, segue para o histórico e apresenta o panorama executivo em formato compacto. No desktop, o resumo fixo aparece apenas depois que os KPIs saem da tela. No celular, permanece oculto para preservar a área de leitura. Ele não aparece na metodologia.

O sistema usa azul institucional, cinza claro, superfícies planas e ícones SVG locais. A tipografia usa fontes do sistema, sem downloads externos. `shell.js` contém somente o comportamento do menu e a apresentação do resumo fixo. Dados, denominadores e fórmulas não foram alterados nesta fase. O cartão RH SolutionsX na vitrine do portfólio também foi atualizado, mantendo seu endereço.

Análises preservadas: faixas etárias, faixas de atingimento das metas, composição de gênero e de modelos de trabalho por departamento, mapa de metas por equipe, faixas salariais, folha e bônus por departamento, acidentes por estado e cargo, pessoas com e sem ocorrências, desligamentos mensais e perfil das saídas.

Transições curtas e a entrada dos cartões respeitam a preferência de redução de movimento. O foco foi reforçado nos controles e elementos de gráficos já acessíveis por teclado. As barras em HTML continuam com tooltip por ponteiro; tornar esses tooltips acessíveis por teclado permanece uma melhoria futura. Os gráficos largos mantêm rolagem interna no celular.

Para executar a versão atual, manter `premium.css`, `shell.js`, `theme.js`, `data.js`, `metrics.js`, `analytics.js`, `visuals.js`, `app.js` e a pasta `assets` junto de `index.html`. Não há instalação ou build obrigatório. Histórico da arquitetura visual e validação: [FASE-2.md](FASE-2.md).

## Funcionalidades

- Navegação lateral no desktop, menu compacto no celular, marca RH SolutionsX e layout responsivo.
- Filtros globais de departamento, UF, modelo de trabalho e status.
- Cartões de ativos, folha base mensal, pessoas com metas atingidas, horas extras e idade média.
- Gráfico amplo com alternância entre quadro reconstruído e admissões/desligamentos.
- Distribuições de gênero, etnia, modelo de trabalho e status.
- Idade média por cargo, metas e horas extras por departamento.
- Bolhas relacionando horas extras médias, atingimento médio das metas e tamanho da equipe.
- Acidentes por departamento, UF ou cargo, em ocorrências por 100 pessoas, com totais absolutos.
- Desligamentos por motivo, tipo e departamento.
- Tabela agregada por cargo, UF ou departamento, com busca, ordenação e exportação CSV.
- Média e mediana salarial dos ativos, comparativos por departamento/cargo e denominadores válidos na tabela e no CSV.
- Distribuição pelo nível de cargo registrado (senioridade), sem estimar tempo de empresa.
- Resumo descritivo que acompanha os filtros e metodologia dentro do painel.

## Fonte, tratamento e limites

Fonte: `Planilha de RH Enterprise - People & Diversity Analytics (100 Funcionarios).xlsx`, fornecida pelo autor. Dados fictícios, conforme confirmação do autor. O Excel original não foi modificado nem incluído no pacote.

Na importação, 91 linhas ativas tinham o campo de motivo de desligamento omitido, deslocando os campos seguintes uma coluna à esquerda. Foi inserido `null` nesse campo, realinhando o bloco numérico. As 90 avaliações registradas como datas foram marcadas como indisponíveis, sem presumir a nota original. Valores monetários e percentuais textuais foram convertidos em números. Nomes e identificadores foram removidos.

Controles independentes da importação: 100 registros, 91 ativos, folha base dos ativos de R$ 1.004.900, 1.061 horas extras no conjunto completo, 6 ocorrências de acidentes e idade média de 33,15 anos no conjunto completo.

Folha base não é receita nem custo total de pessoal. Bônus anual é apresentado separadamente. A competência de metas, folha, horas extras e acidentes não está informada. O histórico de admissões/desligamentos cobre apenas as pessoas presentes na amostra, não necessariamente o quadro completo da empresa. Contagem de desligados não é turnover. Ocorrências por 100 pessoas não equivalem a percentual de acidentados ou frequência por horas de exposição.

O site lê uma versão preparada em `data.js`; não atualiza automaticamente quando o Excel é alterado. Para atualizações, será necessário preparar novamente os registros com o mesmo esquema e validar o alinhamento.

## Verificação realizada

A Fase 3 passou em 21 testes de cálculo com Node, 90 checks de regressão da interface e 48 checks específicos de análise com Playwright no Chrome. Foram reconciliados salários, denominadores e séries históricas; verificados salário médio/mediano por recorte, grupos sem ativos, gráfico de senioridade, tooltip salarial por teclado, tabela e CSV com campos vazios e contagens válidas. Casos sintéticos de nulos foram injetados somente em uma sessão isolada de teste, sem alterar os dados do projeto. Nenhum erro JavaScript foi capturado. As novas análises também foram conferidas em 390 e 320 px e nas capturas de desktop e celular.

Os registros abaixo correspondem às etapas anteriores:

A Fase 2 passou em 90 checks com Playwright no Chrome: totais gerais, recorte Tecnologia, combinação vazia, limpeza de filtros, seis seções, ordenação e pesquisa da tabela, CSV filtrado gravado e lido, tema persistente, resumo durante rolagem, menu por teclado, Escape, link para pular conteúdo e movimento reduzido. Conferidas larguras de 1920, 1440, 1024, 900, 768, 390 e 320 px, sem overflow horizontal da página. Capturas revisadas em desktop claro/escuro, tablet, celular e vitrine do portfólio. Nenhum erro de aplicação capturado. O favicon ausente da raiz do portfólio gera um 404 preexistente na conferência local; o dashboard possui favicon próprio. A execução completa de testes e as evidências ficam fora do pacote público.

O registro a seguir descreve verificações da versão anterior, não novas validações de impressão ou de acessibilidade completa:

Sintaxe JavaScript validada. Testes em Chrome verificaram os cartões, todas as abas, troca da série histórica, agrupamento de segurança, filtros combinados, recorte vazio, limpeza de filtros, agrupamento e busca da tabela, conteúdo do CSV, ausência de erros JavaScript e ausência de transbordamento horizontal no viewport de 390 px. Layout revisado em capturas de desktop e celular. Verificados também: navegação centralizada, resumo fixo durante a rolagem, dez visualizações na visão geral, informações acessíveis por teclado, estilos de impressão e preferência de redução de movimento.

O conteúdo do CSV foi validado em memória. A gravação do download em disco foi cancelada pelo navegador no ambiente de teste e não pôde ser confirmada. O fluxo de publicação no GitHub ainda não foi executado.

## Próximas análises

Para novas versões: snapshots mensais para evolução de folha, metas e horas extras; quadro completo por período para turnover; horas de exposição para acidentes; diversidade por nível de liderança; comparação salarial dentro do mesmo cargo, nível e jornada.
