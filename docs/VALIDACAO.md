# Verificação do portfólio

Use Node 22. Na raiz: `npm ci --ignore-scripts`; em `paradise-island/source`: `npm ci --ignore-scripts`. Depois, na raiz:

1. `npm run check` — sintaxe de JavaScript próprio e scripts HTML incorporados. Não é linter de estilo.
2. `npm run build` — typecheck TypeScript e compilação Vite do Paradise.
3. `npm run check:paradise-build` — compara o build local com o artefato estático versionado.
4. `npx --no-install playwright install chromium` — prepara o navegador de teste, se necessário.
5. `npm test` — unidades do importador, RH, Nexo e Paradise, mais percursos UI com requests interceptados. Sem conexão a Firebase real.

Em uma máquina com Edge instalado, `PORTFOLIO_BROWSER_PATH` e `NEXO_BROWSER_PATH` podem apontar ao executável. Os dois nomes atendem às respectivas suítes. Nenhum teste depende de contas ou dados de produção.

Quando mudar o Paradise, execute `npm run build` e `npm run refresh:paradise` localmente antes da revisão. Esse último comando copia apenas o build local e retira os JS/CSS gerados que o índice anterior referenciava. Fontes, imagens, dados e histórico Git são preservados. Não executa deploy, push ou merge. O CI somente compara e falha se o artefato estiver desatualizado.

Fluxos UI: links desktop abrem/copiam destino e exibem aria-current; âncora inválida não lança exceção; Enter/Escape abre/fecha galeria e devolve foco; filtros da galeria permanecem seletores; menu móvel; planilha existente abre Dados/Análises/Visual; rótulos GBS descrevem as variáveis. As fixtures mínimas de erro não são datasets substitutos.

O smoke usa viewports 1440×900 e 390×900, movimento reduzido e rede externa bloqueada. Não certifica leitor de tela, contraste de todas as fotos, Power BI ou origem dos dados. Capturas de telas com registros não devem ser publicadas sem confirmar sua natureza publicável. Não há configuração de lint adicional; o TypeScript do Paradise é verificado pelo build.

O workflow Quality fixa actions por revisão, tem permissão de leitura e não publica nada. A execução hospedada permanece pendente até publicação autorizada. Os PBIX/PBIP/XLSX existentes não são recalculados nem sobrescritos pelos comandos acima.
