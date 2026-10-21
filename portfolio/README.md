# Portfólio — Caíque Reis da Silva

Portfólio estático em português com sete projetos em destaque, filtros, quatro pastas de materiais, competências, experiência, formação e contato. HTML, CSS e JavaScript sem build nem instalação de dependências.

A identidade visual preserva o fundo escuro original, com controles e cartões em degradê de cinza, textos brancos e animações em prata. As cores da interface são centralizadas nos tokens de `styles.css`; fotos e capturas mantêm as cores originais dos projetos.

## Abrir

Abra `index.html` no navegador. Para a prévia local com Node instalado:

```sh
node preview.mjs
```

Acesse `http://localhost:4173`. O servidor escuta somente na máquina local.

## Endereço público

Publicação no GitHub Pages: https://ofcsilva1.github.io/Projetos/portfolio/

Os arquivos deste site ficam na pasta `portfolio/` do repositório `Ofcsilva1/Projetos`. A página existente na raiz e os dashboards do acervo são preservados.

## Arquivos

- `index.html`: conteúdo e links, disponíveis mesmo sem JavaScript.
- `styles.css`: identidade visual e layout base.
- `enhancements.css`: grade, imagens centralizadas, pastas, menu e Flip Card.
- `script.js`: ampliação das capturas e seção atual na navegação.
- `enhancements.js`: filtros, menu móvel, SplitText nativo e controle de efeitos.
- `contact.js`: opções de e-mail e cópia do endereço.
- `effects/jelly-navigation.js`: microinterações dos botões de navegação e filtros.
- `effects/flip-card.js`: cartão com foto original e informações profissionais no verso.
- `effects/glow-cursor.js`: adaptação do GlowCursor oficial do React Bits.
- `assets/`: foto original, capas reais dos projetos e favicon.
- `vendor/REACT-BITS-LICENSE.md` e `THIRD-PARTY.md`: licença, fontes e limites das adaptações.

O efeito Dither Veil foi retirado a pedido do autor. A foto não é alterada. O verso do cartão apresenta localização, graduação, foco de trabalho e atalhos de contato. A virada funciona por clique/toque e teclado, com as faces fora de uso removidas da navegação e da árvore acessível.

## Catálogo e precisão

Fonte principal: https://ofcsilva1.github.io/Projetos/#projetos e os READMEs de cada repositório. Conferência em 20/10/2026.

Os sete destaques são Dashboard de Vendas com IA, Nexo — Gestão de Casos, Dashboard de Prontuário, RH SolutionsX, Dashboard de Vendas, Paradise Island e Nexora. Os filtros exibem quatro projetos em BI/dados e três em sistemas/sites.

As pastas dão acesso aos dois PDFs exportados, explorador Excel, planilha de previdência, dashboard HTML R, arquivo HTML GBS e arquivos Power BI. O link abaixo das pastas aponta para o repositório `https://github.com/Ofcsilva1/Projetos`.

As ilustrações das pastas usam vermelho para PDF, verde e amarelo para planilhas/ferramentas, azul para HTML e amarelo para Power BI. As opções do topo têm fundo branco e texto preto; o botão do LinkedIn usa azul.

- Vendas com IA: auditoria de 550 registros, conforme escopo informado pelo autor. Não é uma métrica de impacto comercial. O relatório público abriu; as fontes PBIP/PBIR ainda estão incompletas para reprodução independente.
- Nexo: demonstração pública do sistema originalmente chamado Proteja. A demonstração usa dados locais fictícios; o sistema de origem integra Firebase e continua em evolução.
- Prontuário: a capa pública identifica o Projeto Proteja e Power BI/Power Query. Dados demonstrativos conforme o escopo fornecido pelo autor; não foi reexecutada a atualização do PBIX.
- RH SolutionsX: base fictícia de 100 pessoas; não representa uma empresa real.
- Paradise e Nexora: experiências demonstrativas de marcas fictícias, sem reservas reais ou envio de contato.
- PDFs/HTML R: entregáveis exportados. A existência dos arquivos não comprova atualização, fontes, metodologia ou equivalência exata com os modelos PBIX.

Informações de carreira, formação e repertório técnico vieram do texto e das mensagens do autor. Vibe coding foi acrescentado por solicitação explícita, como desenvolvimento assistido por IA e prototipação iterativa. Não foram atribuídos níveis de domínio ou resultados inexistentes.

As certificações em Análise de Dados da IBM e do Google aparecem como em andamento, conforme informado pelo autor. Os títulos são descritivos; nomes oficiais dos programas, datas de conclusão e links de credenciais não foram presumidos.

O cabeçalho usa a marca “portfólio.”. O contato oferece WhatsApp sem exibir o número (destino `https://wa.me/5571988732596`) e um diálogo de e-mail com Gmail, aplicativo padrão e copiar endereço. O Outlook foi retirado por solicitação do autor. Nenhuma mensagem é enviada pelo site.

E-mail confirmado: `caiquereis2k@gmail.com`. Os dois links gerais chamados GitHub apontam para `https://ofcsilva1.github.io/Projetos/#projetos`, como solicitado; links de código de cada projeto mantêm seus repositórios específicos. LinkedIn preservado conforme fornecido, sem afirmar leitura do perfil.

## Publicar no GitHub Pages

Envie `index.html`, CSS, JavaScript, `effects/`, `assets/`, `vendor/` e `.nojekyll` à pasta `portfolio/` do repositório. Não envie `.preview/`. O Pages deve publicar a raiz da branch `main`, incluindo essa pasta. Todos os recursos usam caminhos relativos; não é necessário build. `preview.mjs` serve apenas para desenvolvimento local.

## Verificação e limites

Confira a prévia em desktop e celular; use Tab, Enter/Espaço e Escape no menu, cartão, pastas e capturas. Teste filtros, pausa dos efeitos e os links antes de publicar. A preferência de movimento reduzido desliga a entrada animada e o cursor e deixa as viradas instantâneas.

Os testes realizados nesta revisão são relatados na entrega. Não se afirma certificação WCAG completa, validação em aparelhos físicos ou compatibilidade testada com Safari/Firefox.
