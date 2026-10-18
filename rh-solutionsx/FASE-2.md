# Fase 2 — arquitetura visual e design system

Escopo aprovado: evolução visual do dashboard HTML, preservando os dados e as regras analíticas. Inclui atualização do cartão na vitrine e entrega por pull request, sem merge ou deploy automático.

## Decisões de design

- Público: gestores e profissionais de RH que precisam ler o recorte e acessar as análises rapidamente.
- Azul institucional `#153b50`, destaque `#227d9b`, texto `#1d3342`, fundo `#f3f6f8`, superfície `#ffffff` e borda `#dce5eb`. Os equivalentes escuros estão declarados no mesmo arquivo.
- Tipografia local Segoe UI Variable / Segoe UI / Arial. Valores com algarismos tabulares; títulos de 26–34 px, títulos de painel de 16 px e textos de apoio de 11–13 px.
- Sidebar de 236 px no desktop e 212 px em telas intermediárias. Até 900 px, menu recolhido. Cartões em cinco, três ou duas colunas conforme a largura.
- Primeiro contexto e filtros; depois KPIs, histórico, panorama compacto, distribuições e tabela. Todos os gráficos existentes foram preservados.
- Superfícies planas e bordas leves distinguem os grupos. O preenchimento em degradê do histórico existente foi preservado como parte do gráfico.
- O resumo fixo repete informações somente quando os cartões saem da tela no desktop. No celular, a leitura permanece livre dessa faixa.
- Os painéis menores agora usam grid, em ordem visual compatível com a ordem do documento, em vez de colunas CSS.

## Organização

- `premium.css`: única folha carregada, tokens, componentes, temas, responsividade, foco, movimento e impressão.
- `shell.js`: menu móvel, foco e visibilidade do resumo durante a rolagem.
- `index.html`: estrutura semântica e ícones SVG locais.
- `app.js`: somente alterações de apresentação dos cartões e da ordem das seções; fórmulas mantidas.
- `visuals.js`: somente ajuste do título e da quebra de linha do panorama; cálculos mantidos.
- `data.js` e `theme.js`: preservados integralmente.
- Folhas CSS anteriores preservadas no repositório, sem carregamento na versão atual.
- `../index.html`: título, descrição, tag e aviso de dados fictícios do cartão RH SolutionsX; links mantidos.

## Validação em 18/10/2026

90 checks automatizados aprovados com Playwright e Chrome, além da inspeção inicial no Chrome conectado:

- 91 ativos, folha R$ 1.004.900, metas 64,0%, 1.061 h extras e idade média exibida de 33,2 anos.
- Tecnologia: 16 registros, 15 ativos, folha R$ 163.700 e 11/16 pessoas com meta atingida, exibido como 68,8%.
- Filtros combinados sem registros, valores indisponíveis e limpeza dos filtros.
- Seis seções e estado ativo da navegação; alternância das duas séries históricas e agrupamento de segurança.
- Tabela por cargo/departamento, pesquisa e ordenação crescente.
- Download CSV salvo e lido: cabeçalho e uma linha no recorte pesquisado, com folha de Tecnologia preservada.
- Tema escuro e persistência após recarregar.
- Menu móvel, foco ao abrir, Escape com retorno ao botão e foco no conteúdo após escolher seção.
- Link para pular conteúdo, foco de 3 px nos filtros e ausência de animação do conteúdo com movimento reduzido.
- Larguras efetivas de 320, 390, 768, 900, 1024, 1440 e 1920 px, sem overflow horizontal global. Gráficos e tabelas largos usam rolagem interna.
- Vitrine atualizada e abertura do dashboard por seu cartão.
- Capturas após o término das animações, revistas em desktop claro/escuro, tablet e celular. Corrigida a quebra do valor da folha em telas estreitas.
- Dez combinações principais de texto/superfície verificadas por fórmula de contraste; todas acima de 4,5:1. Isso não certifica conformidade WCAG integral nem todas as cores dos gráficos.
- Sintaxe JavaScript conferida e ausência de erros de aplicação. A raiz do portfólio ainda solicita um favicon ausente (404 preexistente); o dashboard possui favicon SVG próprio.

O script de QA, dependências, resultados e capturas ficam na pasta local `rh-solutions-fase2-qa`, fora do checkout. Não são publicados com o dashboard.

## Limites preservados e próximo escopo

Nenhum novo indicador, filtro de período/cargo, seleção cruzada ou ajuste de denominador foi implementado. Os riscos de nulos e de divergência futura no denominador de metas identificados na Fase 1 continuam documentados para a Fase 3. Turnover e evolução mensal dependem de dados adicionais. O logo original permanece sem otimização. Impressão, Safari, Firefox e leitor de tela não foram validados nesta fase.

## Skills utilizadas

- `executive-dashboard-builder`: preservação do contexto analítico e reconciliação dos KPIs.
- `frontend-design` e `senior-web-designer`: direção visual, hierarquia, componentes e adaptação mobile.
- `web-design-guidelines`: revisão de foco, semântica, contraste, controles e movimento.
- `frontend-testing-debugging` e `playwright`: testes de regressão e revisão de capturas. Foram usados os controles Playwright do Chrome conectado e um script Playwright separado para larguras exatas e evidências em disco, após falhas intermitentes de captura no navegador conectado.
- `playwright-interactive`: consultada na auditoria; runtime separado não utilizado nesta fase.
- `react-best-practices`: não aplicável; projeto mantido em HTML/CSS/JavaScript.
