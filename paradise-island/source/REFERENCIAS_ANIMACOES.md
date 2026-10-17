# Referências de animação

Data: 17/10/2026. Análise estática dos snippets e prints, complementada por leitura das páginas de origem. Nenhum componente foi montado ou executado.

## Correspondência

- `codigo das fotos.txt` + print `000037`: CircularCarousel. Perspectiva, inércia e imagem em fragmentos. A origem externa não é indicada nesse TXT; não atribuir autoria como fato. React e CSS, sem motor 3D/WebGL.
- `codigo do carrossel de fotos.txt` + print `000714`: DriftWall. [Fonte indicada](https://reactbits.dev/components/drift-wall), consultada; descreve mural infinito com elevação no hover. React e CSS. É um mural, não o carrossel principal.
- `Botoes anim.txt` + print `000555`: RubberSegment. [Fonte indicada](https://reactbits.dev/micro/rubber-segment), consultada; seletor de segmentos elástico. React, Motion e CSS.
- `codigos do botao de noturno ou claro.txt` + print `000519`: SquishSwitch. React e Motion; o TXT não fornece URL de origem. Pode inspirar um switch, mas não fornece mudança de tema.
- `draecircle.txt` + print `001254`: DrawCircleText. [Fonte indicada](https://www.hover.dev/components/text#draw-circle-text), consultada; seção disponível. React/Motion, SVG e classes Tailwind.

As páginas textuais estavam acessíveis; demonstrações interativas não foram avaliadas. As condições de licença dos trechos permanecem pendentes antes de reprodução literal.

## Seleção recomendada

Prioridade: transições suaves de imagem/texto, seleção discreta de filtros e um único traço SVG. O carrossel principal deve usar fotos grandes com controles visíveis e operação manual. A referência circular pode inspirar o movimento sem reproduzir toda a geometria.

DriftWall: adiar. O código agenda frames mesmo com reduced motion, cria cópias focáveis e não fornece ação aos divs com role button. É necessário corrigir essas questões antes de reaproveitar. O mural tende a competir com o clima contemplativo.

SquishSwitch: adiar junto com o tema completo. A mudança dia/entardecer será uma seção narrativa, sem alterar a preferência de tema do usuário.

RubberSegment: adaptar para filtros com baixa elasticidade. DrawCircleText: reescrever com SVG/CSS se isso permitir dispensar a dependência Motion. O plano técnico prefere evitar três bibliotecas de animação simultâneas.

## Requisitos para qualquer adaptação

Controles nativos de botão/link, nomes em português, foco visível, sem informação exclusiva de hover, toque e teclado equivalentes. Sem autoplay obrigatório. Cancelar animações fora da tela, ao desmontar e com aba oculta. Preferência reduce elimina deslocamentos, perspectiva e deformação. Nenhuma animação deve bloquear o conteúdo principal ou a navegação Voltar.

Critérios futuros: testar setas, Home/End, Enter/Espaço, foco ao trocar imagem e retorno da lightbox; validar pausas e evitar anúncios de leitor de tela em cada frame. Conversão para TypeScript deverá descrever props e validar listas vazias e valores numéricos.
