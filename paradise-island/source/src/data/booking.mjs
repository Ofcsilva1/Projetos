export const interests = ['hospedagem', 'gastronomia', 'bem-estar', 'nautica', 'praia-piscina', 'celebracoes'];
export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}
export function validateConsultation({ arrival, departure, adults, interest }, today = localDateString()) {
  /** @type {Record<string, string>} */
  const errors = {};
  if (!isDate(arrival)) errors.arrival = 'Escolha uma data de chegada válida.';
  else if (arrival < today) errors.arrival = 'A chegada deve ser hoje ou em uma data futura.';
  if (!isDate(departure)) errors.departure = 'Escolha uma data de saída válida.';
  else if (isDate(arrival) && departure <= arrival) errors.departure = 'A saída deve ser depois da chegada.';
  if (!/^\d+$/.test(String(adults)) || !Number.isSafeInteger(Number(adults)) || Number(adults) < 1) errors.adults = 'Informe ao menos um adulto, em número inteiro.';
  if (!interests.includes(interest)) errors.interest = 'Selecione um interesse da lista.';
  return errors;
}

export function nightCount(arrival, departure) {
  if (!isDate(arrival) || !isDate(departure) || departure <= arrival) return null;
  const utc = value => { const [year, month, day] = value.split('-').map(Number); return Date.UTC(year, month - 1, day); };
  return (utc(departure) - utc(arrival)) / 86400000;
}

export function nextCalendarDay(value) {
  if (!isDate(value)) return '';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day + 1, 12);
  return localDateString(date);
}
