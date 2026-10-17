export type ImageId = 'aerea' | 'piscina' | 'villa' | 'spa' | 'nautica' | 'sunset' | 'jantar' | 'recepcao' | 'detalhes';
export const media: Record<ImageId, { alt: string; category: string; title: string }> = {
  aerea: { alt: 'Vista aérea ilustrativa do resort, com piscina, pavilhões de palha e píer diante do mar turquesa', category: 'A ilha', title: 'Uma ilha, infinitas pausas' },
  piscina: { alt: 'Piscina de borda infinita com cabanas claras, palmeiras e o oceano ao fundo', category: 'Mar', title: 'Entre a água e o horizonte' },
  villa: { alt: 'Quarto de madeira com cama de dossel, varanda e piscina voltada para a praia', category: 'Estadia', title: 'Seu refúgio particular' },
  spa: { alt: 'Pavilhão aberto de massagens em meio à vegetação tropical', category: 'Bem-estar', title: 'O tempo de cuidar de si' },
  nautica: { alt: 'Píer de madeira com paddleboard e barco nas águas transparentes', category: 'Mar', title: 'Caminhos pelo azul' },
  sunset: { alt: 'Bar à beira-mar com lanternas e palmeiras ao pôr do sol', category: 'Sabores', title: 'A hora dourada' },
  jantar: { alt: 'Mesas de jantar na areia, iluminadas por lanternas ao anoitecer', category: 'Sabores', title: 'À mesa, junto ao mar' },
  recepcao: { alt: 'Recepção aberta em madeira natural com jardins tropicais e espelho de água', category: 'A ilha', title: 'Chegar. Respirar. Ficar.' },
  detalhes: { alt: 'Bandeja de alimentos sobre a piscina com o oceano ao fundo, cena ilustrativa', category: 'Sabores', title: 'Os pequenos prazeres' },
};
export type Service = { id: string; eyebrow: string; title: string; description: string; highlights: string[]; image: ImageId; href: string };
export const services: Service[] = [
  { id: 'hospedagem', eyebrow: '01 / ESTADIA', title: 'Seu próprio refúgio.', description: 'Bangalôs e villas privativas para viver a ilha no seu ritmo. Privacidade, vista para o mar e piscinas privativas compõem a experiência de hospedagem.', highlights: ['Privacidade', 'Vista para o mar', 'Piscinas privativas'], image: 'villa', href: '/acomodacoes' },
  { id: 'gastronomia', eyebrow: '02 / SABORES', title: 'O oceano à mesa.', description: 'A alta culinária encontra uma atmosfera especial no restaurante pé na areia. Frutos do mar frescos e menu degustação conduzem a descoberta dos sabores da ilha.', highlights: ['Restaurante pé na areia', 'Frutos do mar frescos', 'Menu degustação'], image: 'jantar', href: '/gastronomia' },
  { id: 'bem-estar', eyebrow: '03 / EQUILÍBRIO', title: 'Um tempo só seu.', description: 'Massagens ao ar livre convidam a uma pausa junto à natureza. Terapias holísticas e rituais relaxantes completam a proposta de bem-estar.', highlights: ['Massagens ao ar livre', 'Terapias holísticas', 'Rituais relaxantes'], image: 'spa', href: '/experiencias#bem-estar' },
  { id: 'nautica', eyebrow: '04 / DESCOBERTA', title: 'Siga o azul.', description: 'Mergulho, paddleboard e passeios de barco aproximam você da paisagem marinha. A exploração de corais integra as experiências da ilha.', highlights: ['Mergulho e corais', 'Paddleboard', 'Passeios de barco'], image: 'nautica', href: '/experiencias#nautica' },
  { id: 'praia-piscina', eyebrow: '05 / HORIZONTE', title: 'Nada além do agora.', description: 'A piscina de borda infinita prolonga o encontro com o mar. Cabanas privativas, atendimento exclusivo e drinks autorais completam os momentos de descanso.', highlights: ['Piscina de borda infinita', 'Cabanas privativas', 'Drinks autorais'], image: 'piscina', href: '/experiencias#praia-piscina' },
  { id: 'celebracoes', eyebrow: '06 / ENCONTROS', title: 'Momentos que ficam.', description: 'Celebrações exclusivas à beira-mar fazem parte da proposta da ilha. O pôr do sol oferece a atmosfera para eventos privados e casamentos.', highlights: ['Eventos privados', 'Casamentos à beira-mar', 'Cenário de pôr do sol'], image: 'sunset', href: '/experiencias#celebracoes' },
];
export const nav = [
  { href: '/ilha', label: 'A ilha', image: 'aerea' as ImageId },
  { href: '/acomodacoes', label: 'Acomodações', image: 'villa' as ImageId },
  { href: '/experiencias', label: 'Experiências', image: 'spa' as ImageId },
  { href: '/gastronomia', label: 'Gastronomia', image: 'jantar' as ImageId },
  { href: '/galeria', label: 'Galeria', image: 'sunset' as ImageId },
];
export const galleryIds: ImageId[] = ['piscina', 'villa', 'spa', 'nautica', 'sunset', 'jantar', 'recepcao', 'detalhes'];
export const imageUrl = (id: ImageId, width = 1280) => `${import.meta.env.BASE_URL}media/${id}-${width}.jpg`;
