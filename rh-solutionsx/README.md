# RH SolutionsX — People Analytics

Dashboard executivo de portfólio para explorar quadro, remuneração, metas, diversidade, horas extras e desligamentos. Construído com HTML, CSS e JavaScript, sobre uma amostra fictícia de 100 pessoas. Funciona sem instalação, build ou serviços externos.

[Código-fonte](https://github.com/Ofcsilva1/Projetos/tree/main/rh-solutionsx) · [Dashboard HTML](index.html) · [Vitrine do portfólio](../index.html)

## O que o projeto demonstra

- **People Analytics:** indicadores com fórmulas, população e denominadores explícitos; separação entre fatos observados e análises que exigem mais dados.
- **Visualização:** histórico anual, distribuições, composições, heatmap, comparativos salariais e tabela gerencial.
- **Engenharia frontend:** estado central validado, seleção cruzada, filtros temporais, URLs compartilháveis e exportação consistente.
- **UX e qualidade:** temas claro/escuro, teclado, movimento reduzido, mensagens de erro/vazio, navegação responsiva e verificações automatizadas.
- **Desenvolvimento assistido por IA:** evolução em cinco fases, revisão humana por pull request e preservação dos dados de origem.

É um ambiente demonstrativo. A base não representa uma empresa real e não constitui evidência de resultados empresariais obtidos pelo autor.

## Executar e testar

Abra `index.html` desta pasta em um navegador moderno, mantendo os scripts, `premium.css` e `assets/` juntos. Também é possível servir o repositório localmente:

```sh
python -m http.server 4182 --bind 127.0.0.1
```

Na raiz do repositório, acesse `http://127.0.0.1:4182/rh-solutionsx/`. Com Node.js 18 ou superior, execute na pasta `rh-solutionsx`:

```sh
npm test
```

No PowerShell com restrição a scripts `.ps1`, use `npm.cmd test`. Os 42 testes de métricas e filtros usam módulos nativos do Node, sem instalar dependências. O dashboard não precisa de Node para abrir.

Para hospedagem estática, publique a raiz do repositório e preserve a pasta `rh-solutionsx/`; o `index.html` da raiz é a vitrine. Não é necessária compilação nem variável de ambiente. As alterações chegam à versão publicada depois da revisão e incorporação da respectiva PR e do fluxo de hospedagem.

## Refinamento premium

Os rankings têm altura controlada e rolagem por teclado, com todas as categorias do recorte disponíveis. Os grupos de cartões preservam a ordem de leitura, sem junção automática em um falso masonry. Desligamentos começa pela movimentação mensal antes dos motivos e do perfil.

**Remuneração por departamento:** pontos de média (círculo turquesa) e mediana (quadrado violeta), conectados na mesma escala dentro do painel. Valores em reais, quantidade de ativos e salários válidos permanecem explícitos. A diferença absoluta aparece no tooltip e não pressupõe causas ou desigualdade.

**Remuneração por cargo:** um salário informado recebe um único marcador. Grupos com múltiplos salários válidos recebem média e mediana. O seletor oferece Top 12, Top 24 e Todos; a busca considera todos os cargos elegíveis. Busca e limite são locais desse gráfico, não alteram KPIs/CSV e não são armazenados no link. Uma mudança de recorte restaura Top 12 e limpa essa busca local. A escala permanece fixa para os cargos do recorte, mesmo durante a busca.

Os temas compartilham turquesa/violeta e estrutura, com cores ajustadas ao contraste. O modo claro usa superfícies neutras suaves e sidebar grafite, inspirado na referência enviada. A logo original foi preservada; versões transparentes foram preparadas localmente com autorização explícita, incluindo lettering claro para a sidebar. Detalhes: [REFINAMENTO-PREMIUM.md](REFINAMENTO-PREMIUM.md) e [assets/README.md](assets/README.md).

## Como explorar

1. Navegue entre Visão geral, Pessoas & diversidade, Desempenho & custos, Saúde & segurança, Desligamentos e Metodologia.
2. Combine departamento, cargo, UF, modelo de trabalho, status e senioridade. Cada condição precisa ser atendida: os filtros se combinam por interseção.
3. Clique numa barra, legenda, faixa, bolha, composição ou célula do heatmap. Enter e Espaço também selecionam. Etiquetas mostram o recorte e permitem remover condições individuais. Repetir a mesma seleção remove os campos correspondentes; isso inclui pontos anuais de movimentação.
4. Em **Filtrar por datas de movimentação**, escolha admissão, desligamento ou união dos dois eventos. Início e fim são inclusivos e opcionais. Edite e use **Aplicar período**; uma faixa inválida mantém o resultado anterior.
5. Use **Copiar link** para compartilhar seção, filtros aplicados e configuração da tabela. Recarregar e voltar/avançar restauram o estado. Se a cópia automática falhar, o endereço fica disponível em um campo selecionável.
6. Agrupe a tabela por departamento, UF ou cargo, busque grupos e ordene pelos cabeçalhos. A busca afeta apenas a tabela e o CSV; não muda os KPIs e gráficos.
7. **Exportar resumo CSV** gera 16 colunas do recorte, respeitando busca, agrupamento e ordenação. O arquivo usa UTF-8 com BOM, ponto e vírgula, vírgula decimal e até duas casas. Valores indisponíveis ficam vazios.

Limpar filtros remove condições globais, período e busca, preservando seção, agrupamentos e ordenação. Os catálogos mostram todas as categorias da fonte; uma combinação impossível aparece vazia e não é alterada silenciosamente.

**O período define uma coorte de pessoas, não a competência dos valores.** Folha, bônus, metas, horas extras e acidentes continuam sendo os valores registrados dessas pessoas. Status e atributos são os registrados na fonte, sem reconstrução de seus valores históricos. União de eventos conta cada pessoa uma vez. O filtro de desligamento exige status desligado e datas válidas em ordem cronológica.

Faixas salariais restringem a ativos com salário válido, acompanhando a população da distribuição. Comparativos por cargo/departamento selecionam a categoria no conjunto geral, sem adicionar status implicitamente. O quadro reconstruído no fim do ano é descritivo; pontos de admissão/desligamento selecionam o ano inteiro.

## Métricas e denominadores

`metrics.js` é a camada de cálculo compartilhada por cartões, gráficos, resumos, tabela e CSV. Valores válidos são números finitos e não negativos. Zero é observado; nulos, textos, infinitos e negativos são indisponíveis. Categorias ausentes aparecem como “Não informado”.

- **Ativos:** contagem de registros com `Status = Ativo` no recorte.
- **Folha base mensal:** soma de `Salario_Base` válido dos ativos. Exclui bônus, benefícios, encargos e custo de horas extras.
- **Salário médio:** folha válida ÷ quantidade de salários válidos dos ativos. Não é média simples das médias de departamentos.
- **Mediana salarial:** valor central dos salários válidos ordenados; com quantidade par, média dos dois centrais.
- **Bônus anual:** soma de `Bonus_Anual_RS` válido dos ativos, apresentada separadamente da folha mensal.
- **Pessoas com meta ≥ 100%:** quantidade de metas válidas ≥ 100 ÷ quantidade de metas válidas × 100. Ausência não é falha.
- **Meta média:** média aritmética dos percentuais individuais válidos, com pesos iguais por pessoa.
- **Horas extras:** soma de `Horas_Extra_Mes` válido; a média divide pela quantidade de pessoas com horas válidas.
- **Idade média:** soma das idades válidas ÷ quantidade de idades válidas registradas, sem atualização pelo calendário.
- **Ocorrências por 100 com informação:** soma de `Acidentes_Trabalho` válido ÷ pessoas com informação válida de acidentes × 100. Pode ultrapassar 100; não é percentual de acidentados nem frequência por horas de exposição.
- **Pessoas com ocorrência:** contagem com acidentes válidos > 0; sem informação é separado de zero ocorrência.
- **Senioridade e composição:** contagem pelas categorias registradas, sem inferência por idade ou tempo de empresa.
- **Bolhas:** médias de horas/metas e área da bolha usam somente pessoas com ambos os valores válidos; a área representa essa população.
- **Histórico anual:** admissões por ano válido e saídas com datas válidas em ordem. Em 31/12, contar quem entrou até o corte e saiu depois dele. Quem sai em 31/12 já está fora. O histórico é apenas da amostra.

Sem valores válidos numa população não vazia, uma soma é indisponível (“—”). Sem registros elegíveis, uma soma/contagem é zero; médias, medianas e taxas continuam indisponíveis. Denominador zero não gera taxa zero fictícia. Cálculos não têm arredondamento intermediário. A tabela explicita os denominadores “n”.

Diferenças salariais são descritivas, sem ajuste por cargo, nível ou jornada. Não comprovam equidade ou discriminação. Contagens de desligados não representam turnover. Relações entre metas, horas extras e acidentes não demonstram causalidade.

## Fonte e qualidade

Fonte declarada na preparação original: `Planilha de RH Enterprise - People & Diversity Analytics (100 Funcionarios).xlsx`, fornecida pelo autor. Dados fictícios, conforme confirmação do autor. O Excel não foi alterado nem incluído no pacote. O site lê a versão preparada em `data.js`; não sincroniza alterações do Excel.

Na preparação original, 91 linhas ativas tinham o motivo de desligamento omitido, deslocando campos. A inclusão de `null` realinhou o bloco numérico. As 90 avaliações registradas como datas foram marcadas indisponíveis, sem estimar notas. Textos monetários/percentuais foram convertidos em números, e nomes/identificadores foram removidos. Essas transformações antecedem a evolução em cinco fases.

Revisão de 18/10/2026: 100 registros, 26 campos, 91 ativos, 9 desligados, nenhuma linha integralmente idêntica e nenhuma data inválida ou saída anterior à admissão. Os 91 ativos não têm data/tipo/motivo de desligamento; são ausências esperadas. Há 90 avaliações de desempenho indisponíveis, não usadas nos indicadores. Sem identificadores, não é possível certificar unicidade por pessoa apenas pela ausência de linhas idênticas.

Controles da base completa: folha R$ 1.004.900; 91 salários ativos válidos; média R$ 11.042,86; mediana R$ 10.800,00; bônus anual R$ 1.579.100; 64 de 100 metas ≥ 100%; 1.061 horas extras; 6 ocorrências; idade média 33,15 anos. A base e as fórmulas foram preservadas na fase final.

## Arquitetura

- `index.html`: estrutura semântica, filtros, contexto e carregamento ordenado de scripts locais.
- `data.js`: dados preparados; nenhuma chamada de rede ou edição pela interface.
- `metrics.js`: funções puras de agregação e datas, exportadas também para testes Node.
- `filter-state.js`: catálogo, validação, seleção, etiquetas e serialização da URL.
- `app.js`: estado aplicado, composição das telas, tabela, exportação e apresentação numérica.
- `visuals.js` e `analytics.js`: SVGs/componentes HTML, insights descritivos e metodologia.
- `premium.css`: único stylesheet ativo, tokens, temas, responsividade, foco, movimento reduzido e impressão.
- `theme.js`, `shell.js` e `boot.js`: preferência de tema, navegação/resumo e mensagem de recuperação em falha de scripts.
- `tests/`: 21 testes de métricas e 21 de estado/filtros, sem dependências.

`styles.css`, `refinement.css` e `finishing.css` foram mantidos como referência histórica e não são carregados. Os PNGs transparentes de exibição têm 480 × 254 px; a versão original continua disponível. O projeto não usa React, biblioteca de gráficos, fonte remota, analytics de visitantes ou backend. Filtros não enviam dados a serviços. Links compartilhados incluem filtros e busca na URL: trate esse endereço como compartilhável.

## Direção visual e acessibilidade

A hierarquia prioriza contexto, KPIs, tendências, comparações e detalhamento. Os dois temas compartilham turquesa e violeta, com superfícies neutras no claro e grafite no escuro. Os tokens de gráficos mantêm a cor da legenda igual à série durante a troca de tema. A identidade RH e os gráficos sustentados pela fonte foram preservados; não foram reproduzidos dados ou módulos de vendas/reservas das referências.

Fontes do sistema, SVGs locais, foco visível, nomes de controles, atalhos nativos, menu com Escape, etiquetas removíveis e alternativa tabular apoiam a leitura. Gráficos largos e tabela têm regiões de rolagem focalizáveis. Movimento reduzido é respeitado. A escolha manual do tema persiste quando o armazenamento está disponível; restrição de armazenamento não bloqueia o painel.

Na impressão, o tema volta a superfícies claras, ações são ocultas e o contexto registra filtros aplicados, período, população, agrupamento, busca e ordenação. A orientação sugerida é A4 paisagem; para explorar as 16 colunas com conforto, prefira o CSV. Falhas de carregamento/execução exibem orientação para recarregar; sem JavaScript, há uma instrução explícita.

## Validação e desempenho

Na fase final, passaram **42 testes unitários** e **492 verificações de navegador**: 90 regressões visuais/funcionais, 48 verificações analíticas, 154 de interatividade, 74 da fase final e 126 do refinamento premium. As verificações visuais anteriores foram adaptadas aos novos tokens e marcadores aprovados; os checks de cálculo e recorte foram preservados. Foram usados Playwright/Chrome e um smoke test em Edge; sete larguras de 320 a 1920 px. Incluem reconciliação independente, CSV, URLs/histórico, teclado, temas, mobile, impressão, script indisponível, JavaScript desativado, armazenamento bloqueado e abertura direta por arquivo. Sem erros de aplicação nas sessões normais.

Formatadores `Intl.NumberFormat` são reutilizados, evitando sua criação repetida em células e gráficos. Microbenchmark local no Chrome, 25 renderizações por seção após 3 aquecimentos, viewport 1440 × 1100 e movimento reduzido: no refinamento, medianas de 10,2 ms na Visão geral e 21,0 ms em Desempenho & custos. Antes da reutilização de formatadores, a Fase 5 havia medido 17,1 e 37,5 ms, respectivamente. São medições locais da função de renderização, sem representar Core Web Vitals, Lighthouse, rede móvel ou garantia de desempenho em outros dispositivos. Não foram adicionadas dependências de runtime.

Testes de navegador e capturas ficam fora do checkout, em `rh-solutions-fase2-qa/refinement-evidence` e `rh-solutions-fase2-qa/phase5-evidence`, no ambiente de desenvolvimento. Os testes de cálculo/estado permanecem versionados e reproduzíveis com `npm test`. Detalhes finais: [FASE-5.md](FASE-5.md).

## Skills utilizadas

- **executive-dashboard-builder:** grão, consistência dos recortes, indicadores, denominadores e limites temporais.
- **frontend-design e senior-web-designer:** hierarquia, tokens, responsividade, tradução da referência escura e preservação da identidade.
- **web-design-guidelines:** semântica, foco, estado na URL, formulários, apresentação e revisão de interface.
- **frontend-testing-debugging e playwright:** verificações de interface, regressões, erros, teclado, exportação, responsividade e capturas.

React best practices não se aplica à stack vanilla. Playwright Interactive não foi necessário: as ferramentas de QA existentes usam Playwright regular. O Browser plugin não está disponível nesta sessão; por isso foi usado esse caminho de validação.

## Evolução e próximos passos

O refinamento aprovado está documentado em [REFINAMENTO-PREMIUM.md](REFINAMENTO-PREMIUM.md). As decisões e resultados de cada fase ficam em [FASE-2.md](FASE-2.md), [FASE-3.md](FASE-3.md), [FASE-4.md](FASE-4.md) e [FASE-5.md](FASE-5.md). Esses arquivos são registros históricos; este README descreve o comportamento atual.

Para novas análises, obter snapshots mensais para folha/metas/horas; quadro completo por período para turnover; horas de exposição e datas para acidentes; referência temporal para tempo de empresa; cargo, nível e jornada para comparação salarial ajustada. Unicidade por pessoa exigirá identificador consistente na preparação, sem necessidade de publicá-lo.

Safari, Firefox, leitor de tela e paginação física em impressoras não tiveram validação integral. A revisão básica de acessibilidade não equivale a certificação WCAG. A base de 100 registros não exige virtualização; volumes maiores devem ser medidos antes de adotar uma estratégia de tabela e ingestão.
