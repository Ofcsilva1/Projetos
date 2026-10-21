# Recursos e adaptações

## React Bits

Referência: [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits), copyright (c) 2026 David Haz. Licença completa em `vendor/REACT-BITS-LICENSE.md` (MIT + Commons Clause). O código é utilizado como parte deste site de portfólio.

- `effects/glow-cursor.js`: port do GlowCursor oficial. Simulação de fluido e shaders preservados, com ciclo de vida adaptado para JavaScript. Cor #d2d2d6, brilho moderado, qualidade baixa e sem explosões ao clicar. Alternativa CSS quando WebGL não está disponível.
- `effects/flip-card.js`: interpretação do Flip Card em HTML/CSS/JavaScript. Foto original na frente e informações profissionais no verso. Virada por botão, Enter/Espaço e retorno com Escape; inclinação discreta com ponteiro. Não implementa arraste ou o runtime React/Motion do componente completo.
- `effects/jelly-navigation.js`: interpretação do Jelly Radio para navegação por links e filtros por botões, com indicação de seleção e animação curta. Sem alterar a semântica dos controles para radio.
- Nome: interpretação do preset rise do SplitText com Web Animations nativo. Entrada escalonada por caracteres, sem GSAP/React e sem todos os presets da biblioteca.
- Pastas: interpretação do Folder em HTML/CSS. Frente articulada e folhas em camadas, com abertura nativa por `details/summary`. Sem renderer de vidro ou arraste do componente completo.

Referências:

- https://reactbits.dev/c/micro/jelly-radio
- https://reactbits.dev/micro/flip-card
- https://reactbits.dev/c/text-animations/split-text
- https://reactbits.dev/c/components/folder
- https://reactbits.dev/animations/glow-cursor?color=9aa2bb

O efeito Dither Veil e sua dependência OGL foram removidos a pedido do autor. Nenhum efeito de dithering é aplicado à fotografia.

## Imagens

Retrato fornecido por Caíque Reis e preservado sem edição. Prévia dos projetos com capturas reais das telas iniciais de suas demonstrações públicas. O enquadramento é centralizado, preserva a proporção e não cria imagens de resultados inexistentes.

Não há CDN ou dependência npm para executar o site. Os efeitos podem ser pausados e respeitam a preferência de movimento reduzido. O cursor decorativo é desativado para ponteiros de toque e não intercepta cliques.
