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

Esta cobertura não afirma conformidade WCAG completa. NVDA/VoiceOver, outros navegadores e aparelhos físicos permanecem pendentes.

## Fase 3 — navegação e continuidade

As seções usam `#casos`, `#cadastro/etapa-1` a `#cadastro/etapa-8`, `#agenda` e `#pendencias`. Entrar respeita a seção do link; recarregar continua exibindo a entrada demonstrativa. As URLs e o estado de histórico não incluem nomes, CPF ou identificadores de prontuário. A etapa substitui a entrada atual do histórico; Voltar/Avançar percorrem as seções. Filtros e seleção de prontuário permanecem apenas na memória da página.

Voltar, Avançar e alterações manuais do fragmento respeitam a proteção dos rascunhos. Cancelar a saída mantém formulário e URL; confirmar descarta o preenchimento não salvo. Links de cadastro abrem uma ficha nova após recarregar, pois não identificam registros nem armazenam rascunhos. Para editar um registro salvo, abra-o na lista.

O cadastro apresenta etapa atual, Anterior/Próxima e oito abas acessíveis diretamente. Trocar de etapa não salva, valida obrigatoriedade nem apaga campos. A validação ao salvar continua direcionando ao campo inválido. No celular, as abas aparecem em duas colunas.

Após confirmação da gravação existente, a lista oferece Continuar editando, Adicionar atendimento e Continuar na lista. As duas primeiras opções usam o registro salvo na memória, sem adicioná-lo à URL. Erros de gravação mantêm o formulário e não oferecem essas ações. A persistência e as transações locais permanecem intactas.

Abaixo de 768 px, as tabelas de casos, agenda e pendências apresentam linhas como blocos com rótulos, preservando todas as células, detalhes e ações. Os cabeçalhos continuam disponíveis às tecnologias assistivas; a leitura efetiva com leitores de tela requer validação manual. No desktop, permanecem tabelas.

Os testes da Fase 3 cobrem URLs, histórico e cancelamento, entrada por link, etapas, validação, continuidade após salvar, atendimento vinculado e campos/ações móveis. Usam dados fictícios e Edge/Chromium. Safari, Firefox, NVDA/VoiceOver e aparelhos físicos permanecem pendentes.

## Fase 4 — refinamento visual institucional

A marca NEXO, Inter, azul e grafite são preservados. A direção é tornar o trabalho com prontuários mais legível, com hierarquia de títulos, textos secundários maiores e contraste mais forte, sem redesenhar as telas ou os fluxos. Os campos passam a usar texto de 16 px no tamanho padrão da página; os cabeçalhos da tabela deixam de usar caixa alta e espaçamento excessivo. Rótulos, indicadores de situação e textos das tabelas ficam maiores.

O CSS centraliza cores de bordas, superfícies de campos, placeholders e espaçamentos de 8/12/16/24 px. Controles somente de leitura usam fundo próprio e borda tracejada, mantendo o texto selecionável. Botões mantêm alvos de pelo menos 44 px, com estados de hover, foco e desabilitado; o botão de salvamento em andamento mantém cursor de progresso. No celular, o botão de tema da entrada fica acima do cartão para evitar sobreposição em telas baixas. As abas podem reorganizar as colunas quando o texto é ampliado.

Os testes medem contraste de pelo menos 4,5:1 para texto dos campos, placeholders, rótulos e botões primários verificados; pelo menos 3:1 para a borda dos campos. Isso não representa auditoria de todos os pares de cores ou certificação WCAG. São verificados layouts em 320/390/768/1440 px, ambos os temas, diálogos e texto ampliado a 200%. As regressões das fases anteriores continuam na suíte.

Escopo desta fase: `style.css`, versão visual em `index.html`, este README e `tests/fase4-ui.test.cjs`. Não modifica JavaScript de negócio, persistência, autenticação, permissões ou dados. A PR visual parte da branch da Fase 3 enquanto ela estiver em revisão; incorpore a Fase 3 antes da Fase 4. A prévia demonstrativa pode reunir ambas para avaliação.

Skills usadas na Fase 4: `frontend-design` orienta a preservação da identidade, hierarquia e contenção visual; `web-design-guidelines` orienta legibilidade, foco, estados, movimento reduzido e reflow; `frontend-testing-debugging` orienta inspeção renderizada e regressões. O plugin Browser não está disponível; a suíte usa Playwright existente com Edge/Chromium. Safari/Firefox, NVDA/VoiceOver e dispositivos físicos permanecem pendentes.
