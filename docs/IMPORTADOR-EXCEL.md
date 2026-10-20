# Importador Excel — validação e limites

Abra `Importador_Excel_Dados.html` por HTTP ou como arquivo local. A biblioteca de leitura e os módulos são incorporados ao HTML; não é necessário enviar a planilha para um servidor. Use apenas arquivos que você tenha autorização para examinar.

As camadas Análises e Visual compartilham `ExcelValidation`: cabeçalhos não vazios repetidos são rejeitados, colunas obrigatórias são conferidas e células de erro não viram números. Uma falha impede os indicadores dependentes; a exploração genérica das abas continua disponível. Nenhuma coluna é escolhida silenciosamente por sobrescrita de nome.

Datas aceitas: objetos Date válidos da leitura Excel; strings `AAAA-MM-DD`; timestamps ISO com `T` e fuso explícito (`Z` ou deslocamento). O calendário é validado antes da conversão: dias inexistentes são rejeitados, sem normalização para outro mês. Datas e competências continuam calculadas em UTC. Timestamps sem fuso e textos adicionais são rejeitados para evitar interpretação dependente da máquina.

O filtro “Ano da última competência” corresponde ao ano do último mês do histórico. A data cadastral de referência exibida é outro conceito; não foi usada para rebatizar resultados como se fossem histórico dessa posição.

Testes: `node --test tests/importador-validation.test.cjs`. Os casos usam apenas células mínimas de fixture para validar erros e preservação de valores, não um novo dataset de análise. O XLSX original, seus caches/fórmulas e todos os PBIX/PBIP permanecem preservados. Os testes não certificam recálculo Excel, adequação financeira individual ou origem publicável dos registros.

Pendências: recuperação do processo bruto→validado e comprovação de proveniência exigem materiais do autor. Nenhum dataset, resultado gerencial ou fonte R foi inventado para preencher essas lacunas.
