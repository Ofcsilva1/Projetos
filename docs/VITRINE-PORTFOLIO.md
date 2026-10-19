# Vitrine do portfólio

## Orientação atual

A vitrine possui oito cartões e uma lista de materiais com ferramenta Excel, PDFs por título, HTML R, arquivos e links Power BI. “Projetos selecionados” descreve a curadoria; placeholders e tutoriais privados não são demonstrações de competência implementada. Os links de relatório publicado não certificam cálculos ou permissões do modelo.

Verifique navegação e reflow em desktop/celular usando [o roteiro de validação](VALIDACAO.md). O workflow Quality verifica código/testes/build e não realiza deploy. A aplicação Paradise mantém fonte e build estático sincronizados por comando local explícito; isso não publica o site.

## Histórico — inspeção de 16/10/2026

Os parágrafos seguintes registram a primeira versão e não descrevem a quantidade atual de cartões, a configuração atual de CI ou a disponibilidade atual dos links. Os HTTP 404 citados são resultados históricos, não falhas atuais confirmadas.

Atualização: o cartão de sistema passa a abrir [Nexo — Gestão de Casos](../sistema-casos/), demonstração com login preenchido e sem banco remoto. As notas abaixo registram a inspeção anterior à primeira publicação. O Pages foi posteriormente publicado com sucesso em `main` + `/(root)`.

A primeira versão de `index.html` apresentava quatro cartões em tema escuro. O CSS e os ícones da vitrine são locais; sua navegação funciona sem JavaScript, instalação ou compilação.

## Publicação e verificação em 16/10/2026

- O repositório informa `has_pages: true`, mas `https://ofcsilva1.github.io/Projetos/` e `/Projetos/rh-solutionsx/` responderam HTTP 404 durante a inspeção. Isso não identifica a branch/pasta configurada nem descarta domínio personalizado.
- Não existem `CNAME`, workflow, configuração Jekyll ou página inicial na raiz na versão base `c00c6a4`.
- A configuração administrativa de Pages não pôde ser lida: o conector não expõe o endpoint `/pages` e o navegador disponível estava sem login. A consulta pública desse endpoint retornou 404.
- `https://ofcsilva1.github.io/Proteja/` respondeu HTTP 200. O portfólio aponta para esse endereço existente; o acesso aos registros continua condicionado ao login do sistema.
- Não foi localizado endereço de relatório publicado no Power BI Service. Vendas aponta para o PDF já existente em `Other` e para o PBIX original em `Projetos`.
- Os dois PDFs vinculados existem na árvore de `Ofcsilva1/Other`, branch `main`. A publicação dos relatórios não é modificada.

## Após revisar e incorporar o pull request

1. Conferir **Settings → Pages** e anotar branch, pasta, domínio e URL efetivamente publicados. Nenhuma configuração de hospedagem foi alterada neste PR.
2. Se a publicação usa `main` e `/(root)`, a nova página inicial poderá ser servida após o processamento do Pages. Se usa `/docs` ou outro processo, ajustar a publicação em uma alteração específica e revisada; não mover as aplicações.
3. Verificar o endereço informado pelo GitHub e os caminhos antigos do currículo, incluindo aplicações HTML, arquivos PBIX/XLSX e `rh-solutionsx/`.
4. Se houver um endereço público autorizado do Power BI Service, adicioná-lo mantendo as opções atuais de arquivo e relatório.

## Compatibilidade

Nenhum arquivo funcional existente foi removido, renomeado ou editado. A vitrine adiciona apenas `index.html` e `assets/portfolio/portfolio.css`; os demais ajustes são de documentação. Links locais são relativos e funcionam com o prefixo `/Projetos/`. Os nomes originais com espaços são preservados e codificados nos links.

Não há novos workflows nem deploy automático de PR. Não é preciso publicar todos os arquivos em uma hospedagem diferente. O PBIX, a planilha, os PDFs e os dashboards mantêm seus locais originais.

## Verificação local

Servir a raiz do repositório com um servidor HTTP estático. Conferir a página em desktop e celular, navegação por teclado, links dos quatro cartões, seção de materiais e carregamento de `rh-solutionsx/`. A comparação com a versão base deve mostrar apenas adições de site e alterações de documentação; arquivos funcionais antigos devem manter os mesmos hashes.
