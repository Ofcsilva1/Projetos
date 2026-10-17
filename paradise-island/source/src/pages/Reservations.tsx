import { useSearchParams } from 'react-router-dom';
import { Media } from '../components/Media';
import { Eyebrow } from '../components/Primitives';
import { ConsultationWizard } from './ConsultationWizard';

export function Reservations() {
  const [params] = useSearchParams();
  const initialInterest = params.get('interesse') || 'hospedagem';
  return <section className="reservation-layout"><div className="reservation-visual"><Media id="piscina" priority sizes="(max-width: 960px) 100vw, 45vw" /><div><Eyebrow>UM TEMPO PARA VOCÊ</Eyebrow><h1>Sua próxima<br /><em>pausa começa aqui.</em></h1></div></div><div className="reservation-content"><Eyebrow>PLANEJE SUA ESTADIA</Eyebrow><h2>Imagine<br />os seus <em>dias.</em></h2><p>Uma data. Uma companhia. Um desejo de estar presente. Organize sua estadia em três passos, no seu ritmo.</p><div className="demo-notice"><span aria-hidden="true">◇</span><p>Projeto de portfólio. Não há envio de dados, consulta de disponibilidade ou confirmação de reserva.</p></div><ConsultationWizard key={initialInterest} initialInterest={initialInterest} /></div></section>;
}
