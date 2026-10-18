# Fase 5 — qualidade, desempenho e documentação

Escopo autorizado em 18/10/2026: revisão final do dashboard, otimização e documentação para o portfólio, com uma PR para revisão humana. Durante a execução, o autor acrescentou uma referência visual de modo escuro. A Fase 4 (#13) já estava incorporada à `main`; a entrega final parte do mesmo conteúdo, sem merge automático.

## Resultado e decisões

- Modo escuro com fundo `#101113`, superfícies grafite, bordas discretas, texto claro, verde `#77d5b0` e violeta `#b69be9`. A referência orienta o tratamento de superfícies e cores; a marca RH, a hierarquia e as análises de pessoas permanecem próprias do projeto. Não foram adicionados módulos de vendas nem métricas da imagem.
- Tokens de gráficos compartilhados entre SVGs, barras e legendas permitem trocar o tema sem refazer os dados. A preferência manual continua persistente quando o armazenamento permite; a primeira visita segue o sistema.
- `Intl.NumberFormat` reutilizado por tipo e precisão, evitando criar formatadores repetidos em cada célula/barra. Fórmulas, dados, população e regras de arredondamento permanecem iguais.
- Correção encontrada na revisão: pontos anuais de movimentação agora também desfazem o período ao repetir a mesma seleção, como as demais seleções. Enter e Espaço foram exercitados nessa alternância.
- Regiões de gráficos largos e tabela recebem foco para rolagem por teclado, com nome acessível e foco visível.
- Impressão preserva os filtros aplicados e o contexto temporal, identifica população, agrupamento, busca e ordenação, oculta ações e usa superfícies claras. Layout sugerido A4 paisagem. A tabela tem 16 colunas; o CSV continua sendo a opção para exploração detalhada.
- `boot.js` acompanha falhas de scripts/carregamento e mostra orientação de recuperação. O carregamento é ocultado após renderização bem-sucedida. Sem JavaScript, há instrução explícita.
- README consolidado para apresentar o projeto: propósito, execução, arquitetura, uso, fontes, fórmulas, decisões, Skills, testes e melhorias futuras. Os arquivos das fases anteriores permanecem como histórico, sem suas antigas pendências confundirem a descrição atual.
- Cartão do RH SolutionsX na raiz do portfólio atualizado para mencionar filtros interativos, compartilhamento e o modo escuro em grafite. Endereço e demais projetos preservados.

## Qualidade dos dados e preservação

Revisão independente da versão preparada: 100 linhas, 26 campos, 91 ativos e 9 desligados. Nenhuma linha integralmente idêntica, nenhuma data inválida, nenhuma saída anterior à admissão. Sem identificadores, isso não certifica unicidade por pessoa.

As 91 ausências de data, tipo e motivo de desligamento correspondem aos ativos. As 90 avaliações indisponíveis permanecem fora dos indicadores. Campos numéricos usados nos KPIs atuais não têm ausências na amostra original; testes sintéticos cobrem nulos, zero, texto, negativos e denominador vazio.

Nenhuma alteração em `data.js`, `metrics.js` ou `filter-state.js`. SHA-256 do arquivo de dados: `d66f4902fff52523cd438eb77bf923f08fb0fce637d535bc9437764dacd523c5`. Controles: folha R$ 1.004.900; salário médio R$ 11.042,86; mediana R$ 10.800,00; 64 metas atingidas entre 100; 1.061 horas extras; 6 ocorrências; idade média 33,15 anos. O painel identifica a base fictícia e a falta de competência mensal.

## Verificações executadas

- `npm.cmd test`: **42 testes aprovados**, sendo 21 de métricas e 21 de estado/filtros. Sem dependências externas.
- Regressão completa com Playwright/Chrome: **90** verificações da Fase 2, **48** da Fase 3 e **154** da Fase 4, aprovadas na versão final.
- Fase 5: **74** verificações adicionais aprovadas. Total de navegador: **366**, além dos 42 testes unitários.
- Identidade da página, conteúdo inicial, ausência de overlay de framework, console sem erros nas sessões normais, capturas desktop/mobile e fluxo de interação verificados.
- Tema escuro por preferência do sistema, alternância e persistência, cores de séries, mediana violeta e superfícies claras preservadas no tema claro.
- Seis seções com controles nomeados, imagens com alternativa e ausência de overflow global. Modo escuro conferido em 1920, 1440, 1024, 900, 768, 390 e 320 px.
- Seleção/desseleção anual por Enter/Espaço, sincronização do período, menu com Escape/foco, rolagem horizontal do gráfico por seta e ausência de animações com movimento reduzido.
- Emulação de impressão: recorte, período e busca visíveis, aviso de competência preservado, ações ocultas, tabela sem recorte horizontal/vertical e retorno correto à tela.
- Falha de `metrics.js` injetada em sessão isolada: mensagem de recuperação. JavaScript desativado: orientação presente. Armazenamento bloqueado: painel e tema continuam funcionais. Arquivo local: KPIs e filtros funcionam sem servidor.
- Portfólio: link do dashboard e descrição atualizada confirmados.
- Smoke test no Microsoft Edge: KPIs, filtro Tecnologia, navegação entre as seis seções e celular 390 px. Não equivale à regressão completa realizada no Chrome.

Ferramentas e capturas permanecem fora do checkout, em `rh-solutions-fase2-qa/phase5-evidence`. Scripts usados: `verify.cjs`, `verify-phase3.cjs`, `verify-phase4.cjs`, `verify-phase5.cjs` e `benchmark-phase5.cjs`. A revisão visual incluiu desktop escuro, remuneração, celular, gráfico no celular, contexto de impressão e tabela. A pasta contém resultados JSON, auditoria de dados e capturas.

## Medição local de renderização

Chrome headless, viewport 1440 × 1100, preferência de movimento reduzido, 100 registros. Para cada seção: 3 aquecimentos e 25 chamadas da função `render`, medindo tempo síncrono com `performance.now`. Referência anterior à otimização e execução final no mesmo ambiente:

- Visão geral: mediana 17,1 → 9,2 ms.
- Pessoas & diversidade: 14,8 → 3,9 ms.
- Desempenho & custos: 37,5 → 20,4 ms.
- Saúde & segurança: 18,8 → 10,7 ms.
- Desligamentos: 9,5 → 2,4 ms.

O microbenchmark indica redução do trabalho síncrono de formatação/renderização nesta máquina. Tem variabilidade e não mede pintura completa, rede, uso de memória, Lighthouse ou Core Web Vitals em campo. Não é promessa para celulares ou bases maiores. A aplicação continua estática, com fontes do sistema, scripts locais e nenhum pacote novo de runtime.

## Skills e limites finais

`executive-dashboard-builder` orientou consistência, qualidade e escopos. `frontend-design` e `senior-web-designer` orientaram a tradução da referência, tokens e revisão visual responsiva. `web-design-guidelines` apoiou foco, semântica, estados, apresentação e desempenho. `frontend-testing-debugging` e `playwright` orientaram regressões, falhas, teclado e evidências. O Browser plugin não está disponível; foi usado Playwright regular já existente no ambiente de QA. React best practices não se aplica a HTML/CSS/JS; Playwright Interactive não foi necessário.

Safari, Firefox e leitor de tela não tiveram validação integral. Impressão foi verificada por emulação de mídia e capturas; paginação física e drivers de impressora permanecem não validados. A revisão básica não certifica conformidade WCAG completa. Não há dados suficientes para turnover completo, snapshots mensais de folha/metas/horas, tempo de empresa ou risco de acidentes por exposição. Essas melhorias exigem ampliar a fonte antes de criar indicadores.

As cinco fases autorizadas estão implementadas. A entrega final segue para revisão por pull request; a incorporação e publicação permanecem sob controle do autor.
