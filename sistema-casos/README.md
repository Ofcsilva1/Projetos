# Nexo — Gestão de Casos

Demonstração pública do sistema de gestão de casos, com marca genérica própria, acesso direto sem login, tema claro e escuro e armazenamento local por aba. Esta versão mantém os campos, filtros, cadastro/edição, agenda, pendências, importação de planilhas e exportações do sistema de origem.

Não carrega Firebase, não acessa o banco original e não altera o sistema anteriormente publicado. Os nomes de campos e formatos de planilha continuam compatíveis. O identificador `visitante-local` é apenas o autor local dos registros, não uma conta autenticada.

## Dados

A primeira abertura inclui 12 registros de exemplo explicitamente fictícios. Estes exemplos foram criados para a demonstração: não são uma cópia da planilha mencionada na conversa, que não estava disponível neste checkout. Para usar a mesma planilha fictícia, selecione **Importar planilha** e confira a prévia antes de confirmar. Nenhum dado de visitante é enviado para o GitHub ou para um banco remoto.

As alterações ficam no `sessionStorage` desta aba e sobrevivem ao recarregamento; normalmente são removidas ao fechar a aba. Exporte os dados para guardá-los. O botão **Restaurar demonstração** pede confirmação antes de descartar alterações/importações e restaurar os exemplos. Se o armazenamento estiver indisponível, um aviso informa que alterações duram apenas até recarregar. Se a quota esgotar, o salvamento falha sem substituir o conjunto anterior.

## Marca e publicação

`marca.svg` contém uma marca vetorial Nexo sobre uma superfície escura com borda, legível em ambos os temas. As referências à marca anterior foram retiradas da interface, nomes de exportação e preferência de tema desta demonstração.

O cartão da vitrine aponta para `sistema-casos/`. Incorpore este PR manualmente após revisão. O GitHub Pages configurado em `main` + `/(root)` deve publicar o novo caminho sem alterar os demais endereços. O repositório e o sistema originais são preservados.

## Executar

Sirva a raiz de `Projetos` com um servidor HTTP e abra `/sistema-casos/`. Não há build. Bootstrap, fontes, ícones e bibliotecas de PDF continuam usando os CDNs da aplicação de origem; o leitor XLSX está em `vendor/` com a licença correspondente.
