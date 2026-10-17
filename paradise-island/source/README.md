# Paradise Island — Código-fonte

Experiência de portfólio em React 19, TypeScript, Vite, React Router e Motion. Fontes locais Manrope e Cormorant Garamond. Fotos responsivas do acervo do projeto, navegação entre seções, galeria filtrável, carrossel e consulta demonstrativa local.

## Desenvolvimento

Requer Node.js 22.12+ ou 24. Nesta pasta, execute:

```sh
npm ci
npm run dev
npm test
node scripts/check-contrast.mjs
npm run build
```

O build é gerado em dist/. Para atualizar o GitHub Pages, copie o conteúdo de dist/ para a pasta superior paradise-island/, preservando source/, e envie as alterações por pull request. O portfólio já usa publicação da branch main a partir da raiz; esta adição não altera a configuração de hospedagem.

## Estrutura e referências

- src/: componentes, páginas, estilos e regras da consulta.
- public/: favicon e as versões JPEG responsivas das nove imagens.
- tests/: validações de datas e preferências de estadia.
- reference-sources/ e referências Markdown: fontes dos componentes e registro das adaptações.
- Referências animadas: RubberSegment, EchoText, ScrollVelocity, CircularCarousel, DriftWall, LogoLoop, SpecularButton e SquishSwitch. O botão especular foi adaptado para CSS; os arquivos oficiais de referência foram mantidos.

## Verificação e limites

Compilação, seis testes de consulta e dez combinações sólidas de contraste aprovados. Home conferida no Chrome em desktop e celular. Navegação de estadia para Início corrigida, incluindo a sincronização do destaque animado.

Projeto fictício, sem preços, backend, reservas reais ou envio de dados. A vista aérea é artística, derivada das referências; não representa uma planta comprovada. Nenhum dado pessoal é necessário para a demonstração. As imagens originais pesadas, caches, dependências e capturas de trabalho não fazem parte deste pacote público.
