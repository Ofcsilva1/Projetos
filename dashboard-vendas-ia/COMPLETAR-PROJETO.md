# Concluir o pacote do dashboard

## Recuperar os arquivos

- Localizar o projeto original no Power BI Desktop e salvar uma cópia como projeto PBIP em uma pasta separada.
- Reunir a pasta do relatório e o modelo correspondente, preservando as referências relativas. Não basta copiar somente o arquivo PBIP.
- Se o relatório usar um modelo remoto, confirmar essa configuração em definition.pbir e preparar uma alternativa demonstrativa ou documentar os requisitos de acesso sem expor identificadores privados.
- Fornecer fontes sintéticas ou públicas permitidas e um dicionário de dados. Não enviar as bases institucionais originais.

## Preparar uma cópia publicável

- Inspecionar consultas M, TMDL, parâmetros, anotações, conexões e recursos visuais.
- Substituir caminhos absolutos, nomes de usuários locais, servidores internos e identificadores privados por parâmetros demonstrativos.
- Remover credenciais, tokens, segredos, dados pessoais, caches, arquivos temporários e configurações locais.
- Verificar também dados inseridos manualmente e nomes de arquivos ou imagens que possam identificar pessoas.
- Usar apenas uma base demonstrativa revisada. Este PR não afirma que a base original é fictícia.

## Validar antes de acrescentar ao PR

- [ ] O PBIP resolve a pasta do relatório.
- [ ] definition.pbir resolve o modelo local ou descreve a dependência remota sanitizada.
- [ ] O projeto abre e atualiza com fontes demonstrativas em outro ambiente.
- [ ] As duas páginas, as medidas e os totais são verificados.
- [ ] A auditoria dos 550 registros é documentada com evidências demonstrativas.
- [ ] Todos os arquivos a incluir foram inspecionados, além das regras de exclusão.
- [ ] O diff contém somente os arquivos revisados.
- [ ] A revisão humana do PR foi concluída; merge permanece manual.

## Limite desta entrega

Foi recebido apenas o arquivo referencial de 298 bytes. Não foi possível auditar medidas, visuais, dados, fontes ou a execução do dashboard. O PBIX de vendas já existente na raiz não foi substituído nem usado para preencher as pastas ausentes.
