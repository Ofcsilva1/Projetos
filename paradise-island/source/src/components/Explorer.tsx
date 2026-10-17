import { useState } from 'react';
import { Media } from './Media';
import { Eyebrow, TextLink } from './Primitives';
import { services } from '../data/content';
export function Explorer({ compact = false }: { compact?: boolean }) {
  const destinations = [services[0], services[2], services[3], services[4], services[1]];
  const [selected, setSelected] = useState(0);
  const current = destinations[selected];
  return <div className={`explorer ${compact ? 'compact' : ''}`}><div className="explorer-scene"><Media id="aerea" sizes="(max-width: 960px) 100vw, 65vw" /><span className="scene-caption">VISTA AÉREA ILUSTRATIVA · SEM ESCALA GEOGRÁFICA</span><div className="explorer-index" aria-hidden="true">0{selected + 1}<span>/ 05</span></div></div><div className="explorer-content"><Eyebrow>ESCOLHA O SEU CAMINHO</Eyebrow><div className="explorer-options" role="group" aria-label="Ambientes da ilha">{destinations.map((destination, i) => <button key={destination.id} onClick={() => setSelected(i)} aria-pressed={i === selected} aria-controls="ambiente-painel"><small>0{i + 1}</small>{['Acomodações', 'Spa & bem-estar', 'O mar', 'Praia & piscina', 'Gastronomia'][i]}<span aria-hidden="true">{i === selected ? '−' : '+'}</span></button>)}</div><div className="explorer-panel" id="ambiente-painel" aria-live="polite" aria-atomic="true"><Media id={current.image} /><h3>{current.title}</h3><p>{current.description}</p><TextLink to={current.href}>Conhecer este ambiente</TextLink></div></div></div>;
}
