# Nexo — Gestão de Casos

Demonstração pública do sistema de gestão de casos, com marca genérica própria, entrada demonstrativa com usuário e senha preenchidos, tema claro e escuro e armazenamento local por aba. Esta versão mantém os campos, filtros, cadastro/edição, agenda, pendências, importação de planilhas e exportações do sistema de origem.

Não carrega Firebase, não acessa o banco original e não altera o sistema anteriormente publicado. Os nomes de campos e formatos de planilha continuam compatíveis. O identificador `visitante-local` é apenas o autor local dos registros, não uma conta autenticada.

## Dados

A primeira abertura inclui 12 registros de exemplo explicitamente fictícios. Estes exemplos foram criados para a demonstração: não são uma cópia da planilha mencionada na conversa, que não estava disponível neste checkout. Para usar a mesma planilha fictícia, selecione **Importar planilha** e confira a prévia antes de confirmar. Nenhum dado de visitante é enviado para o GitHub ou para um banco remoto.

As alterações ficam no `sessionStorage` desta aba e sobrevivem ao recarregamento; normalmente são removidas ao fechar a aba. Exporte os dados para guardá-los. O botão **Restaurar demonstração** pede confirmação antes de descartar alterações/importações e restaurar os exemplos. Se o armazenamento estiver indisponível, um aviso informa que alterações duram apenas até recarregar. Se a quota esgotar, o salvamento falha sem substituir o conjunto anterior.

## Marca e publicação

`marca.svg` contém uma marca vetorial Nexo sobre uma superfície escura com borda, legível em ambos os temas. As referências à marca anterior foram retiradas da interface, nomes de exportação e preferência de tema desta demonstração.

O cartão da vitrine aponta para `sistema-casos/`. A tela de entrada traz `visitante@exemplo.com` e `NexoDemo2026` já preenchidos. São valores públicos de demonstração, sem conta Firebase e sem função de controle de segurança. O botão Entrar abre a interface local; Sair retorna à entrada sem excluir os dados da aba. Recarregar volta à tela de entrada. Incorpore este PR manualmente após revisão. O GitHub Pages configurado em `main` + `/(root)` deve publicar o novo caminho sem alterar os demais endereços. O repositório e o sistema originais são preservados.

## Executar

Sirva a raiz de `Projetos` com um servidor HTTP e abra `/sistema-casos/`. Não há build. Bootstrap, fontes, ícones e bibliotecas de PDF continuam usando os CDNs da aplicação de origem; o leitor XLSX está em `vendor/` com a licença correspondente.

## Fase 1 — integridade dos formulários

Novos casos iniciam origem, cor, situação, comunicação, retorno, estudo e plano sem uma resposta escolhida. Número do prontuário e data de entrada continuam sendo os únicos campos obrigatórios do cadastro. Valores existentes e importados são preservados.

Erros identificáveis aparecem junto ao campo, com descrição acessível e foco na aba correspondente. Um aviso do navegador protege preenchimento não salvo e gravações pendentes ao recarregar ou sair. O aviso depende do navegador e de interação prévia; não garante recuperação após fechamento forçado. Não há armazenamento de rascunhos.

Registros já salvos continuam no `sessionStorage` e sobrevivem ao recarregamento, como antes. Cancelar, sair ou restaurar após confirmação descarta o preenchimento pendente; restaurar também substitui os registros salvos pelos exemplos fictícios, conforme a confirmação existente.

### Testes

Em `sistema-casos/`, execute `npm ci`, `npx playwright install chromium` e `npm test`. Opcionalmente, `NEXO_BROWSER_PATH` aponta para Chrome/Edge já instalado. Playwright é somente uma dependência de desenvolvimento; o site continua sem build.

A suíte usa um domínio HTTPS interceptado, dados sintéticos e serviços locais do próprio NEXO, sem chamadas externas. As fixtures incluem Bootstrap 5.3.0 para exercitar as oito abas reais. Os testes cobrem persistência por aba, campos neutros, edição de valores importados, validação, recarregamento, cancelamento, saída, falta de espaço, memória temporária e responsividade. Não representam certificação WCAG ou validação em todos os navegadores.

`NEXO_QA_DIR` opcional indica uma pasta fora do repositório para capturas. `NEXO_TEST_ASSETS` opcional aponta para bibliotecas visuais/PDF locais, com os nomes e versões dos CDNs existentes, para capturas completas; nenhuma chamada real é permitida quando ausente.

`NEXO_TEST_ROOT` opcional permite verificar a mesma interface em um pacote estático separado, sem modificar o código-fonte.

## Fase 2 — acessibilidade e cabeçalho móvel

Em telas até 820 px, marca, navegação e ações ocupam linhas separadas. Tema, saída, restauração e portfólio permanecem visíveis, com áreas de toque de pelo menos 44 px. O desktop mantém a composição existente e a barra lateral permite rolagem em janelas baixas.

O cadastro possui rótulos associados aos campos; os controles têm atributos `name`, e CPF continua sendo texto com teclado numérico. Botões de exportação têm nomes explícitos, detalhes indicam seu estado expandido e a navegação identifica a seção atual. Os títulos principais, atalhos para acesso/conteúdo, abas e painéis possuem semântica e foco próprios. Ícones decorativos são ocultos das tecnologias assistivas.

Os testes verificam teclado, associação de campos, nomes e estados acessíveis, foco de diálogos nativos e contraste do indicador de foco nos dois temas. O cabeçalho é verificado em 320, 360, 390 e 768 px, incluindo ausência de sobreposição, controles descobertos, áreas de toque e aumento de texto a 200%. Os testes anteriores de persistência e integridade continuam na suíte.

Esta cobertura não afirma conformidade WCAG completa. NVDA/VoiceOver, outros navegadores e aparelhos físicos permanecem pendentes. As melhorias de navegação por URL e os demais refinamentos visuais das fases seguintes não fazem parte desta etapa.
