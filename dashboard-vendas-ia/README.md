# Dashboard de Vendas com IA

Projeto de portfólio de Business Intelligence desenvolvido com assistência de agentes de IA.

[Ver dashboard público no Power BI](https://app.powerbi.com/view?r=eyJrIjoiMmVjZDcwNTQtNGVmMS00M2M5LTgwM2MtNzdlMDJiYTQ2NDY0IiwidCI6ImQyMWQ1Y2VkLTZjN2EtNGE0OC1hMzU5LTNlNDFkMDI3NjgxMyJ9&pageName=4d5352ba00b2140c2054)

## Objetivo e escopo

Acompanhar indicadores financeiros e analisar vendas por produto, região e canal. Conforme descrição do autor, o trabalho envolve duas páginas, auditoria de 550 registros e uso de Power BI, DAX, Codex, VS Code, MCP e arquivos PBIP/PBIR. Esses detalhes documentam o escopo informado; não foram verificados no código, porque as definições do relatório e do modelo não foram recebidas.

## Estado da publicação

**Relatório publicado e arquivo PBIX disponíveis.**

[Baixar Dashboard_Vendas_IA.pbix](Dashboard_Vendas_IA.pbix) para abrir no Power BI Desktop. O arquivo recebido contém duas páginas de relatório e um modelo de dados. A abertura e a atualização no Power BI Desktop não foram testadas nesta publicação.

O pacote de fontes PBIP/PBIR continua incompleto; as observações abaixo se referem ao PBIP recebido anteriormente.

O anexo PBIP recebido anteriormente, `Dashboard_Vendas_IA(1).pbip`, é um JSON de 298 bytes, versão 1.0. Contém apenas uma referência relativa a `Dashboard_Vendas_IA.Report` e a opção de recuperação automática. Foi mantido com seu nome original em [Dashboard_Vendas_IA(1).pbip](Dashboard_Vendas_IA%281%29.pbip).

Ele não contém visuais, medidas DAX, consultas, dados nem definições do modelo. A pasta referenciada não veio no anexo. Nenhuma pasta `.Report` ou `.SemanticModel` desse projeto foi encontrada na árvore do repositório inspecionada em 16/10/2026. O arquivo `Dashboard de Vendas.pbix` existente na raiz não foi considerado equivalente: não foi possível confirmar sua relação com este PBIP.

O link público foi fornecido e autorizado pelo autor para divulgação. A disponibilidade e o conteúdo visual do serviço não foram verificados nesta entrega.

## Arquivos necessários para concluir

1. Pasta completa `Dashboard_Vendas_IA.Report/`, incluindo `definition.pbir`, definições do relatório e recursos utilizados.
2. Modelo semântico correspondente, normalmente em uma pasta `.SemanticModel/`. O nome e o caminho devem ser confirmados em `definition.pbir`; se houver conexão remota, documentar os requisitos de acesso de modo sanitizado, sem publicar identificadores privados.
3. Base demonstrativa pública ou sintética e instruções de atualização. As fontes originais não foram recebidas, portanto sua natureza e segurança não puderam ser verificadas.
4. Dicionário de dados, regras de cálculo e parâmetros de origem sem caminhos locais identificadores.

Consulte [COMPLETAR-PROJETO.md](COMPLETAR-PROJETO.md) antes de adicionar arquivos.

## Como abrir quando o pacote estiver completo

Preservar o caminho relativo entre o PBIP e a pasta do relatório. Abrir o PBIP no Power BI Desktop compatível com projetos, configurar somente fontes demonstrativas e testar a atualização e a navegação das páginas. Neste estado, o arquivo referencial sozinho não permite esse teste.

## Privacidade e revisão

A publicação inclui documentação, o link público autorizado, o arquivo PBIX fornecido pelo autor, o arquivo referencial PBIP e regras de exclusão. Não inclui currículo, contatos pessoais, bases, credenciais, caches ou caminhos locais. As regras de exclusão reduzem inclusões acidentais, mas todo arquivo futuro ainda precisa de inspeção de conteúdo, inclusive consultas M, TMDL, conexões e recursos.

## Referência técnica

[Projetos do Power BI Desktop — Microsoft Learn](https://learn.microsoft.com/power-bi/developer/projects/projects-overview)
