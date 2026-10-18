# Refinamento premium — revisão visual e funcional

Implementado após auditoria e autorização explícita do autor em 18/10/2026. Escopo: organização espacial, remuneração, consistência dos temas, acabamento, responsividade, logo transparente e atualização do cartão no portfólio. A base, fórmulas e regras de filtros permanecem preservadas.

## Diagnóstico e solução

O antigo `compactPanels` juntava grupos independentes em um grid comum chamado masonry. O cartão mais alto determinava a próxima linha, deixando até 491 px vazios em Pessoas e 469 px em Segurança. Agora os grupos explícitos do HTML são preservados. Rankings têm altura controlada, nomes de regiões, rolagem por teclado e indicação de categorias disponíveis. Todas as linhas do recorte continuam no DOM; não foram excluídas para encurtar a página.

Remuneração ocupava aproximadamente 1.410 px por departamento e 1.694 px por cargo. Os 91 cargos ativos da amostra têm uma pessoa cada, tornando a duplicação de média/mediana pouco informativa. A nova apresentação usa círculos para média e quadrados para mediana na mesma linha, uma escala por painel, quantidade válida e valores em reais. O tooltip informa a diferença absoluta sem presumir causa, dispersão, equidade ou desigualdade ajustada.

Para cargos com apenas um salário válido, há um único marcador e valor. Quantidade de ativos e de salários válidos são mostradas separadamente. Com mais de um salário válido, média e mediana continuam disponíveis. Sem salário válido, não há marcador zero fictício. Desligados não entram na população salarial. `metrics.js` continua responsável pelos cálculos.

A lista de cargos oferece Top 12, Top 24 e Todos, além de busca que considera todos os cargos elegíveis. São controles locais deste gráfico; não alteram filtros globais, KPIs, tabela ou CSV e não são serializados na URL. Ao mudar o recorte ou a seção, retornam ao padrão. Ordenar/buscar a tabela sem recriar a seção mantém o gráfico atual. Buscar não muda a escala dos cargos no recorte e não reinicia animações dos KPIs.

## Organização e identidade

- Visão geral: KPIs e histórico preservados; equipe, vínculos e modelos de trabalho formam três colunas no desktop amplo. Em telas menores, o grupo se reorganiza. O ranking executivo omite apenas a repetição da contagem auxiliar, pois o mesmo valor permanece à direita, no tooltip e na tabela.
- Pessoas: composição, idade/geografia e cargos/senioridade com densidade equilibrada. Composições longas têm rolagem interna acessível.
- Desempenho: remuneração compacta primeiro, seguida de esforço/metas, heatmap, horas, folha e distribuições. Todos os indicadores anteriores permanecem.
- Segurança: estado e pessoas com/sem ocorrência formam o par compacto; cargos e horas extras formam o par denso. O ranking contextual limita a altura, inclusive ao agrupar por todos os cargos.
- Desligamentos: movimentação mensal precede motivos/departamentos (rankings), tipo/modelo (composição) e UF/faixa etária (perfil). Os pares têm densidade semelhante. Contagens disponíveis não se tornam turnover.
- Metodologia: definições preservadas, com título de cálculo sem referência a uma fase de implementação na interface.

Os dois temas compartilham estrutura, tipografia e significados de cor. Turquesa e violeta identificam as mesmas séries; as tonalidades são ajustadas ao contraste. O claro usa superfícies neutras suaves, bordas discretas e sidebar grafite, inspirado na última imagem enviada. O escuro mantém superfícies grafite planas e acentos controlados, sem glow. A referência orientou linguagem visual; não foram copiados módulos de reservas, calendário ou dados de vendas.

Sidebar ampliada para 264 px em telas de pelo menos 1440 px e 248 px entre 1101 e 1439 px, com logo proporcional e menu compacto até 900 px. Espaçamento base de 20 px, rankings com altura máxima de 208 px no desktop e região focalizável, textos auxiliares reforçados e valores monetários alinhados. Gráficos largos mantêm rolagem interna no celular, preservando tamanho de leitura. Transições são curtas e condicionadas à preferência de movimento. Impressão expande as regiões roláveis atualmente exibidas e preserva contexto; Top 12 continua Top 12 até o usuário escolher Todos.

A logo original foi preservada e recebeu duas variantes transparentes, preparadas localmente após autorização específica. A variante de lettering claro é usada na sidebar escura dos dois temas. Detalhes em [assets/README.md](assets/README.md). Nenhuma versão gerada por IA foi incorporada.

## Evidências de organização

Medições com viewport 1440 px, base completa e sem filtros, nos dois temas:

- Pessoas: altura total de 6.303 para 4.295 px; maior diferença entre cartões pareados de 491 para 70 px.
- Desempenho: altura total de 7.469 para 5.003 px; diferenças entre cartões pareados até aproximadamente 25 px. Cartão de cargos abaixo de 700 px.
- Segurança: altura total de 4.014 para 2.913 px; maior diferença entre cartões pareados de 469 para aproximadamente 25 px.
- Visão geral: 4.866 para 3.758 px, com diferença de 57 px entre os três cartões de equipe/vínculos/modelos. Desligamentos: 3.912 para 3.326 px.

São medições desta amostra e viewport, não garantias para qualquer categoria/texto ou configuração. A redução combina organização, altura limitada de listas e comparação salarial; não representa remoção de dados.

## Validação

- **42 testes unitários** de métricas e estado/filtros, com Node nativo, aprovados.
- **508 verificações de navegador:** 90 da estrutura funcional, 48 analíticas, 154 de interatividade, 74 da revisão final e 142 do refinamento.
- As 74 verificações de aparência anteriores foram adaptadas aos novos tokens/shape de marcador aprovados. Checks de cálculo, populações e recortes foram preservados.
- O novo conjunto inclui 96 combinações de seis seções × dois temas × oito larguras: 1920, 1440, 1366, 1024, 900, 768, 390 e 320 px. Sem overflow horizontal global. A revisão adicional de todos os pares fixou o limite verificado de lacuna em menos de 80 px no desktop de 1440 px; o maior valor observado foi 70 px.
- Busca salarial em toda a lista, Top 12/Todos, valor individual independente, tooltip após busca, seleção por teclado, busca vazia e texto semelhante a HTML, sem injeção.
- Fixture isolada: grupo com salários 100/200/600 resulta em média 300 e mediana 200; profissional individual com salário 1.000 tem um marcador; salário nulo permanece indisponível e desligado não entra no cálculo. A fixture não foi gravada na base.
- Rankings de segurança por cargo mantêm os 96 cargos do recorte completo, com altura controlada. Impressão expande rankings e remuneração.
- Logo com alpha real, cantos transparentes, pixels opacos e 480 px de largura. Original sem alteração.
- Contraste de legendas testado nos dois temas, além de foco e teclado. Isso não é certificação WCAG completa.
- Sem erros JavaScript nas sessões normais. Sintaxe de todos os scripts e whitespace do diff conferidos.

Playwright/Chrome foi usado porque o Browser plugin não está disponível nesta sessão; o conjunto anterior inclui smoke test em Edge. Capturas e scripts ficam fora do checkout, em `rh-solutions-fase2-qa/refinement-evidence`. Testes unitários permanecem versionados e rodam com `npm test` ou `npm.cmd test` no PowerShell.

## Skills, preservação e limites

`frontend-design` e `senior-web-designer`: direção, composição, hierarquia e temas. `executive-dashboard-builder`: população salarial, diferenças entre média/mediana e integridade analítica. `web-design-guidelines`: semântica, foco, fontes, estados e transições. `frontend-testing-debugging` e `playwright`: regressões, fixtures, responsividade e inspeção visual. `imagegen` foi tentado para a logo, mas os resultados foram rejeitados; a alternativa local foi autorizada pelo autor. Playwright Interactive estava instalado, porém não foi necessário.

`data.js`, `metrics.js`, `filter-state.js` e `assets/logo.png` permanecem integrais. Não houve inclusão de dependência de runtime, exclusão de arquivos originais, alteração de autenticação ou serviço de dados. Turnover completo, competências mensais, tempo de empresa e risco por exposição continuam dependentes de novas fontes. Safari, Firefox, leitor de tela e paginação física de impressora não tiveram validação integral.

A PR de refinamento aguarda revisão humana. Nenhum merge ou deploy é executado automaticamente.
