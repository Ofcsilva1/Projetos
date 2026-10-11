# RH SolutionsX — People & Diversity Analytics

Dashboard interativo de portfólio em HTML, CSS e JavaScript, com dados fictícios de 100 registros. Sem instalação, build, bibliotecas externas ou conexão com serviços.

## Abrir

Abra `index.html` em um navegador moderno. Mantenha todos os arquivos `.js`, `.css` e a pasta `assets` junto do HTML.

## Publicar no GitHub Pages

1. Extraia o ZIP e envie **o conteúdo da pasta `rh-solutionsx`** para a raiz de seu repositório. O `index.html` deve ficar diretamente na raiz.
2. No repositório, acesse **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch que contém os arquivos (por exemplo, `main`) e a pasta **/(root)**. Salve.
5. Aguarde a publicação e consulte o endereço mostrado pelo GitHub Pages.

Referência: [Documentação oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Atualização visual e analítica

O histórico de quadro no fim do ano usa um gráfico de área com degradê, curva suave e rótulos de dados nos pontos anuais. A suavização é apenas visual: os valores representam posições anuais reconstruídas. A opção de admissões e desligamentos mantém duas séries com rótulos separados para cada ano.

Os filtros usam campos arredondados com superfície própria e destaque de foco. Painéis, cartões e áreas internas dos gráficos têm contraste reforçado com a página, especialmente no modo escuro, com fundos azulados mais claros, contornos suaves e textos mais legíveis.

Modo claro e modo escuro disponíveis no topo. Na primeira visita, o tema acompanha a preferência do sistema; a escolha manual fica salva no navegador. Os gráficos menores são agrupados em colunas com altura natural, evitando painéis esticados com grandes áreas vazias. Os avisos sobre formatos de avaliação foram retirados da interface. O tratamento original dos dados segue documentado neste README.

A visão geral reúne dez visualizações, cinco cartões e um panorama executivo com os principais destaques do recorte. Uma faixa de resumo acompanha a rolagem e permanece disponível em todas as abas. No celular, ela mostra os três indicadores principais para ocupar menos espaço.

A navegação está centralizada. O visual usa superfícies claras, tons suaves, sombras discretas e uma composição curva no panorama executivo. Não há login. Subtítulos e resumos foram reescritos em linguagem natural.

Novas análises: faixas etárias, faixas de atingimento das metas, composição de gênero e de modelos de trabalho por departamento, mapa de metas por equipe, faixas salariais, folha e bônus por departamento, acidentes por estado e cargo, pessoas com e sem ocorrências, desligamentos mensais e perfil das saídas.

Animações de entrada, barras, linhas, roscas e bolhas respeitam a preferência de redução de movimento. Os gráficos têm informações ao passar o cursor e nos elementos acessíveis por teclado. Roscas em SVG e estilos de impressão preservam melhor os preenchimentos na exportação do navegador para PDF.

Os arquivos `visuals.js` e `refinement.css` também devem acompanhar `index.html` na publicação.

## Funcionalidades

- Navegação superior, marca RH SolutionsX e layout responsivo.
- Filtros globais de departamento, UF, modelo de trabalho e status.
- Cartões de ativos, folha base mensal, pessoas com metas atingidas, horas extras e idade média.
- Gráfico amplo com alternância entre quadro reconstruído e admissões/desligamentos.
- Distribuições de gênero, etnia, modelo de trabalho e status.
- Idade média por cargo, metas e horas extras por departamento.
- Bolhas relacionando horas extras médias, atingimento médio das metas e tamanho da equipe.
- Acidentes por departamento, UF ou cargo, em ocorrências por 100 pessoas, com totais absolutos.
- Desligamentos por motivo, tipo e departamento.
- Tabela agregada por cargo, UF ou departamento, com busca, ordenação e exportação CSV.
- Resumo descritivo que acompanha os filtros e metodologia dentro do painel.

## Fonte, tratamento e limites

Fonte: `Planilha de RH Enterprise - People & Diversity Analytics (100 Funcionarios).xlsx`, fornecida pelo autor. Dados fictícios, conforme confirmação do autor. O Excel original não foi modificado nem incluído no pacote.

Na importação, 91 linhas ativas tinham o campo de motivo de desligamento omitido, deslocando os campos seguintes uma coluna à esquerda. Foi inserido `null` nesse campo, realinhando o bloco numérico. As 90 avaliações registradas como datas foram marcadas como indisponíveis, sem presumir a nota original. Valores monetários e percentuais textuais foram convertidos em números. Nomes e identificadores foram removidos.

Controles independentes da importação: 100 registros, 91 ativos, folha base dos ativos de R$ 1.004.900, 1.061 horas extras no conjunto completo, 6 ocorrências de acidentes e idade média de 33,15 anos no conjunto completo.

Folha base não é receita nem custo total de pessoal. Bônus anual é apresentado separadamente. A competência de metas, folha, horas extras e acidentes não está informada. O histórico de admissões/desligamentos cobre apenas as pessoas presentes na amostra, não necessariamente o quadro completo da empresa. Contagem de desligados não é turnover. Ocorrências por 100 pessoas não equivalem a percentual de acidentados ou frequência por horas de exposição.

O site lê uma versão preparada em `data.js`; não atualiza automaticamente quando o Excel é alterado. Para atualizações, será necessário preparar novamente os registros com o mesmo esquema e validar o alinhamento.

## Verificação realizada

Sintaxe JavaScript validada. Testes em Chrome verificaram os cartões, todas as abas, troca da série histórica, agrupamento de segurança, filtros combinados, recorte vazio, limpeza de filtros, agrupamento e busca da tabela, conteúdo do CSV, ausência de erros JavaScript e ausência de transbordamento horizontal no viewport de 390 px. Layout revisado em capturas de desktop e celular. Verificados também: navegação centralizada, resumo fixo durante a rolagem, dez visualizações na visão geral, informações acessíveis por teclado, estilos de impressão e preferência de redução de movimento.

O conteúdo do CSV foi validado em memória. A gravação do download em disco foi cancelada pelo navegador no ambiente de teste e não pôde ser confirmada. O fluxo de publicação no GitHub ainda não foi executado.

## Próximas análises

Para novas versões: snapshots mensais para evolução de folha, metas e horas extras; quadro completo por período para turnover; horas de exposição para acidentes; diversidade por nível de liderança; comparação salarial dentro do mesmo cargo, nível e jornada.
