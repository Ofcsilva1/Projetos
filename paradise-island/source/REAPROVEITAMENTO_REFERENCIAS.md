# Reaproveitamento dos materiais

Data: 17/10/2026. Implementação local autorizada pelo usuário após auditoria e planejamento. Nenhum original foi sobrescrito.

Atualização V2: após nova orientação do usuário, DriftWall também foi incorporado, as animações ganharam destaque na Home e cinco componentes oficiais adicionais foram integrados. O registro atual está em ATUALIZACAO_ANIMACOES.md; os detalhes abaixo descrevem a primeira versão.

## Acervo visual

As oito imagens de ambientes foram usadas. Piscina: hero secundário, experiência e consulta; villa: apresentação e detalhe da hospedagem; spa: experiência e galeria; píer: atividades e hero de experiências; bar: entardecer e celebrações; jantar: gastronomia e atmosfera noturna; recepção: apresentação da ilha; bandeja: detalhe editorial e galeria, sem prometer café flutuante.

Os cinco prints orientaram o estudo de composição e movimentos. Não são assets publicados no site. A vista aérea nova usa piscina, villa, píer, recepção e spa como referências e não pretende estabelecer geografia real.

## Código e links

### CircularCarousel

Origem local: `codigo das fotos.txt`. Cópia adaptada: `src/components/references/CircularCarousel.jsx` e CSS correspondente. Aplicação: vista circular opcional na galeria, mantendo o grid acessível como caminho principal.

Adaptações: imagens locais, sem autoplay, sem introdução, geometria/deformação reduzidas, legendas em português, controles de anterior/próxima, salto imediato em movimento reduzido, tratamento de teclado separado dos botões filhos e correção do ciclo de snap que reagendava frames quando já estava parado. O código original já pausa fora do viewport e em aba oculta.

[Página correspondente encontrada](https://reactbits.dev/components/circular-carousel). O TXT não continha essa URL; a página foi localizada na implementação. Não se presume identidade de versão entre o trecho e a página atual.

### RubberSegment

Origem: `Botoes anim.txt` e [link fornecido](https://reactbits.dev/micro/rubber-segment). Cópia em `src/components/references/RubberSegment.jsx` e CSS. Aplicação: filtros da galeria.

Adaptações: alvo de toque maior, baixa elasticidade, categorias do acervo, cores do design system, proteção de velocidade e ativação por clique de teclado/tecnologia assistiva, além das setas/Home/End existentes. A prop preset do exemplo foi descartada porque não é consumida pelo código.

### SquishSwitch

Origem: `codigos do botao de noturno ou claro.txt`. Cópia em `src/components/references/SquishSwitch.jsx` e CSS. Aplicação: alternar duas cenas editoriais (entardecer/noite), sem introduzir tema global completo.

Adaptações: rótulo acessível contextual, cores naturais, deformação discreta e disabled nativo. O exemplo original era modo avião; não foi tratado como implementação pronta de tema.

### DrawCircleText

Origem: `draecircle.txt` e [link fornecido](https://www.hover.dev/components/text#draw-circle-text). Adaptação em `src/components/Primitives.tsx`, função DrawCircle. Mantidos o traçado SVG e a animação de pathLength; removidas as classes Tailwind, ajustadas cor e proporção, adicionados aria-hidden, execução única e movimento reduzido. Aplicação: palavra “mais” no convite final.

### DriftWall

Origem: `codigo do carrossel de fotos.txt` e [link fornecido](https://reactbits.dev/components/drift-wall). Estudado, mas não incorporado literalmente: clones focáveis, loop permanente e ausência de ação nos botões simulados exigiriam reestruturação significativa. A galeria editorial estática aproveita a ideia de composição e destaque sem esses problemas. Essa é a única das cinco referências de código que não foi incorporada como componente.

## Conteúdo e procedência

`serviços.txt` fundamenta os seis serviços. Contatos são fictícios e aparecem como informação ilustrativa. Não há chamadas de WhatsApp, e-mail ou reserva real. Os trechos fornecidos ficam identificados aqui e nos originais; condições de licença de redistribuição devem ser conferidas antes de uma publicação pública. Esta entrega é local, sem publicação.
