// Verificação reproduzível da paleta sólida; não mede texto sobre fotografias.
const luminance = hex => {
  const rgb = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const pairs = [
  ['Texto principal / areia', '#2c4941', '#faf7f0', 4.5],
  ['Texto secundário / verde claro', '#36564b', '#e8ece4', 4.5],
  ['Botão primário', '#fffdf8', '#173e37', 4.5],
  ['Botão ao passar o ponteiro', '#ffffff', '#204f43', 4.5],
  ['Botão claro / texto', '#173e37', '#fff4dd', 4.5],
  ['Botão claro ao passar o ponteiro', '#173e37', '#e9d7b5', 4.5],
  ['Texto do mural', '#fffdf8', '#123d32', 4.5],
  ['Borda do botão / areia', '#44695e', '#faf7f0', 3],
  ['Foco / areia', '#ac7f34', '#faf7f0', 3],
  ['Foco / mural', '#ac7f34', '#123d32', 3],
];
let failed = false;
for (const [name, foreground, background, minimum] of pairs) {
  const a = luminance(foreground), b = luminance(background);
  const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  console.log(`${ratio >= minimum ? 'PASS' : 'FAIL'} ${name}: ${ratio.toFixed(2)}:1 (mínimo ${minimum}:1)`);
  if (ratio < minimum) failed = true;
}
if (failed) process.exitCode = 1;
