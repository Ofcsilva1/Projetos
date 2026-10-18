# Fase 4 — filtros, interatividade e experiência do usuário

Escopo autorizado: ampliar a exploração do dashboard preservando a interface e os cálculos aprovados. Inclui atualização da descrição do RH SolutionsX na vitrine e uma pull request separada. A Fase 3 ainda estava em revisão no início desta etapa, por isso a branch da Fase 4 foi criada sobre o commit dela, sem fazer merge de nenhuma PR.

## Estado compartilhado

`filter-state.js` reúne catálogo de categorias, validação, filtragem, etiquetas e codificação/decodificação da URL. `app.js` mantém um único estado aplicado, do qual derivam KPIs, gráficos, textos, tabela e CSV. Os filtros se combinam por interseção. O arquivo `data.js` e as fórmulas de `metrics.js` permanecem integrais.

- Campos globais: departamento, cargo, UF, modelo de trabalho, status e nível de cargo (senioridade).
- Seleções adicionais dos gráficos: gênero, etnia, motivo/tipo de desligamento, faixa etária, faixa de meta, faixa salarial, condição de acidentes e mês de saída.
- Etiquetas mostram o recorte e permitem remover cada condição. Limpar filtros remove todos os filtros globais, datas e busca; preserva seção, agrupamentos e ordenação.
- Os catálogos de seleção continuam mostrando todas as categorias da fonte. Combinações impossíveis resultam em recorte vazio, sem trocar categorias ou descartar filtros silenciosamente.

## Significado do período

- **Admissão:** pessoas com Data_Admissao válida dentro dos limites inclusivos.
- **Desligamento:** pessoas com Status = Desligado, admissão e desligamento válidos, saída posterior ou igual à admissão e Data_Desligamento dentro dos limites inclusivos.
- **Admissão ou desligamento:** união dos dois critérios. Uma pessoa entra uma única vez, mesmo tendo ambos os eventos no período.
- Datas inicial/final podem ficar abertas. Sem limites, a seleção usa todos os eventos válidos do tipo escolhido.
- Editar campos não muda os resultados até Aplicar período. Datas invertidas mostram erro, mantêm URL/resultados anteriores e levam o foco ao campo de data.
- O período define uma **coorte de pessoas**, não a competência dos valores. A folha continua sendo a soma dos salários registrados de quem está marcado como ativo no recorte. Metas, bônus, horas extras e acidentes não passam a representar aquele mês ou ano. Um aviso acompanha os filtros temporais.
- O filtro de status permanece o registrado na fonte. Não representa o status histórico da pessoa na data selecionada.

## Seleção cruzada

- Barras e legendas categóricas aplicam a dimensão correspondente a todos os componentes.
- Bolhas e comparativos salariais selecionam departamento/cargo; não restringem implicitamente os demais componentes aos registros usados exclusivamente naquela análise.
- Faixas de salário selecionam somente ativos com salário válido, refletindo a população da distribuição salarial. Esse escopo aparece no nome da etiqueta.
- Composições aplicam departamento e categoria simultaneamente. O heatmap aplica departamento e faixa de meta.
- Pontos de admissões/desligamentos anuais aplicam tipo de evento e ano completo. A posição anual de quadro reconstruído permanece somente descritiva, sem simular snapshot mensal.
- Barras de saídas mensais aplicam mês de desligamento e usam somente datas válidas em ordem cronológica.
- Repetir uma seleção já ativa remove os campos daquela seleção. Etiquetas permitem desfazer somente um campo, e o histórico do navegador permite retornar ao estado anterior.
- Controles têm estado pressionado, foco visível e operação por clique, Enter ou Espaço. Após selecionar um gráfico, o foco vai à etiqueta do recorte ou ao botão de limpeza. Tooltips mantêm nomes, valores e unidades; Escape os fecha.

## Links, histórico e exportação

- URLSearchParams armazena somente o estado reconhecido: seção, filtros, período aplicado, modo do histórico, agrupamento de segurança, agrupamento/busca/ordenação da tabela. Valores padrão são omitidos.
- Estado inválido de categoria, faixa, enum ou período é removido com aviso. Parâmetros desconhecidos são descartados. A busca aceita no máximo 120 caracteres e é escapada na interface.
- Mudanças de filtro, seção e ordenação criam entradas de histórico. Digitação da busca substitui a entrada atual, evitando uma entrada por tecla.
- Voltar/avançar e recarregar restauram controles, seleção e dados. O link não inclui tema, menu aberto, rolagem ou período em edição ainda não aplicado.
- Copiar link usa o recorte aplicado. Se a Clipboard API falhar, um campo somente leitura oferece o endereço selecionável.
- A busca filtra somente grupos da tabela e do CSV. Os KPIs e gráficos continuam usando o recorte global.
- O CSV preserva as 16 colunas da Fase 3, agrupamento e ordenação; cruza todos os filtros globais com a busca local da tabela. Nenhum dado é enviado a um serviço pelo ato de exportar ou copiar o endereço.

## Validação em 18/10/2026

- **42 testes unitários versionados:** 21 de métricas preservados e 21 novos de filtros, limites de faixas, datas, interseção, união sem duplicidade, categoria ausente, URL com caracteres especiais, rejeição de parâmetros inválidos, limpeza e reconciliação com a fonte.
- **90 checks de regressão da Fase 2** e **48 da Fase 3**, com Playwright/Chrome.
- **154 checks específicos da Fase 4**, incluindo contagens, KPIs, resumo e soma da tabela reconciliados independentemente para cada recorte de teste.
- Seleções testadas: barra por teclado, legenda de status e repetição para limpar, gênero + senioridade, composição departamento + gênero, faixa etária, heatmap departamento + meta, comparativo salarial, faixa salarial somente de ativos, UF de acidentes, condição sem ocorrência e mês de saída.
- Datas testadas: ano de admissão por ponto do gráfico, limites inclusivos, edição pendente, faixa invertida preservando resultado/URL, desligamentos, união de eventos e intervalo aberto. Fonte completa: 15 admissões em 2023 e 4 desligamentos em 2024.
- Voltar/avançar, recarregar, copiar endereço, abrir esse endereço em nova aba, restaurar busca/ordenação e exportar CSV com período + departamento + busca.
- URL com parâmetros inválidos e texto semelhante a HTML na busca: sem execução ou elemento injetado. Fallback de cópia testado com Clipboard API bloqueada somente na sessão de teste.
- Sete larguras efetivas: 1920, 1440, 1024, 900, 768, 390 e 320 px, sem overflow horizontal global com filtros ativos. Período expandido também verificado em 390 px.
- Capturas desktop/celular revisadas. Sem erros de aplicação capturados. Fontes e fórmulas preservadas; fixtures e instrumentos de QA permanecem fora do checkout, em `rh-solutions-fase2-qa/phase4-evidence`.
- Execute `npm test` em `rh-solutionsx`, com Node 18+, sem instalar dependências externas. O dashboard continua estático e abre sem build.

## Skills e limites

`executive-dashboard-builder`: recorte compartilhado, denominadores e significado temporal. `frontend-design`: integração dos filtros, etiquetas e controles ao sistema visual existente. `frontend-testing-debugging` e `playwright`: regressões, teclado, histórico, URLs e capturas. `web-design-guidelines`: semântica, foco, feedback, formulários e estado na URL. Não foi introduzido React ou biblioteca de gráficos. O Browser plugin com Skill própria não está listado nesta sessão; os testes usaram Playwright regular na pasta de QA existente.

Não há snapshots mensais nem quadro completo para turnover ou evolução mensal da folha. Não foram criadas inferências para preencher essas lacunas. Filtros trabalham com uma categoria por dimensão e intervalos contínuos. A busca é agregada, pois a base publicada não contém nomes/identificadores individuais. Impressão, Safari, Firefox e leitor de tela não foram validados integralmente nesta fase. A Fase 5 de verificação final, otimização e documentação consolidada continua dependente de autorização.
