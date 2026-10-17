import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { services } from '../data/content';
import { localDateString, validateConsultation, nightCount, nextCalendarDay, interests } from '../data/booking.mjs';
import SpecularButton from '../components/references/SpecularButton';
import { Media } from '../components/Media';
import { Eyebrow } from '../components/Primitives';
import { useMotionSettings } from '../components/MotionSettings';

const interestLabels: Record<string, string> = { hospedagem: 'Bangalôs & villas', gastronomia: 'Gastronomia', 'bem-estar': 'Spa & bem-estar', nautica: 'Atividades no mar', 'praia-piscina': 'Praia & piscina', celebracoes: 'Celebrações' };
type Fields = { arrival: string; departure: string; adults: string; interest: string };

export function ConsultationWizard({ initialInterest }: { initialInterest: string }) {
  const { stopped } = useMotionSettings();
  const [form, setForm] = useState<Fields>({ arrival: '', departure: '', adults: '2', interest: interests.includes(initialInterest) ? initialInterest : 'hospedagem' });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const nights = nightCount(form.arrival, form.departure);
  const update = (key: keyof Fields, value: string) => {
    setForm(previous => ({ ...previous, [key]: value, ...(key === 'arrival' && (!previous.departure || previous.departure <= value) ? { departure: nextCalendarDay(value) } : {}) }));
    setErrors(previous => { const next = { ...previous }; delete next[key]; return next; });
    setResult(false);
  };
  useEffect(() => { if (first.current) { first.current = false; return; } const timer = setTimeout(() => heading.current?.focus({ preventScroll: true }), stopped ? 0 : 300); return () => clearTimeout(timer); }, [step, stopped]);
  const displayDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const confirm = () => { setResult(true); window.setTimeout(() => summary.current?.focus({ preventScroll: true }), 50); };
  const changeStep = (next: number) => { setDirection(next > step ? 1 : -1); setStep(next); };
  const handleInterestKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = services.findIndex(service => service.id === form.interest);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? services.length - 1 : (current + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + services.length) % services.length;
    update('interest', services[next].id);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };
  const details = <dl><dt>Chegada</dt><dd>{displayDate(form.arrival)}</dd><dt>Saída</dt><dd>{displayDate(form.departure)}</dd><dt>Estadia</dt><dd>{nights} {nights === 1 ? 'noite' : 'noites'}</dd><dt>Adultos</dt><dd>{form.adults}</dd><dt>Inspiração</dt><dd>{interestLabels[form.interest]}</dd></dl>;

  return <div className="consultation-wizard"><ol className="wizard-steps" aria-label="Etapas da consulta">{['Suas datas', 'Seu ritmo', 'Revisão'].map((label, index) => <li key={label} className={index === step ? 'active' : index < step ? 'complete' : ''} aria-current={index === step ? 'step' : undefined}><span aria-hidden="true">{index < step ? '✓' : `0${index + 1}`}</span><small>{label}</small></li>)}</ol>
    <form hidden={result} noValidate onSubmit={event => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const candidate = { ...form };
      for (const key of ['arrival', 'departure', 'adults'] as const) if (values.has(key)) candidate[key] = String(values.get(key));
      if (step === 0 && !candidate.departure && candidate.arrival) candidate.departure = nextCalendarDay(candidate.arrival);
      setForm(candidate);
      const found = validateConsultation(candidate, localDateString());
      const relevant = Object.fromEntries(Object.entries(found).filter(([key]) => step === 2 || (step === 0 ? key === 'arrival' || key === 'departure' : key === 'adults' || key === 'interest')));
      setErrors(relevant);
      if (Object.keys(relevant).length) { document.getElementById(Object.keys(relevant)[0])?.focus(); return; }
      if (step < 2) changeStep(step + 1); else confirm();
    }}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={step} className="wizard-panel" onAnimationComplete={() => heading.current?.focus({ preventScroll: true })} initial={{ opacity: stopped ? 1 : 0, x: stopped ? 0 : direction * 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: stopped ? 1 : 0, x: stopped ? 0 : direction * -18 }} transition={{ duration: stopped ? 0 : 0.25 }}>
        <h3 ref={heading} tabIndex={-1}>{['Quando a ilha chama?', 'A ilha, à sua maneira.', 'Sua pausa, em detalhes.'][step]}</h3>
        <p>{['Escolha seus dias. A saída acompanha a chegada, e você pode ajustar como preferir.', 'Escolha a companhia e a experiência que mais inspira você.', 'Confira suas preferências antes de montar o resumo demonstrativo.'][step]}</p>
        {step === 0 && <><div className="wizard-dates">{(['arrival', 'departure'] as const).map(key => <div className={`wizard-input ${errors[key] ? 'invalid' : ''}`} key={key}><label htmlFor={key}>{key === 'arrival' ? 'Chegada' : 'Saída'}<span aria-hidden="true">▦</span></label><input id={key} name={key} type="date" min={key === 'arrival' ? localDateString() : nextCalendarDay(form.arrival) || localDateString()} value={form[key]} onChange={event => update(key, event.target.value)} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />{errors[key] && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} id={`${key}-error`} className="field-error">{errors[key]}</motion.p>}</div>)}</div>{nights && <motion.div className="wizard-night-count" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}><strong>{nights}</strong><span>{nights === 1 ? 'noite para desacelerar' : 'noites para viver em outro ritmo'}</span></motion.div>}</>}
        {step === 1 && <><div className="guest-stepper"><div><strong>Adultos</strong><p>Quem vai compartilhar esses dias?</p></div><div className="guest-stepper-controls"><button type="button" aria-label="Diminuir adultos" disabled={Number(form.adults) <= 1} onClick={() => update('adults', String(Math.max(1, (Number(form.adults) || 1) - 1)))}>−</button><input id="adults" name="adults" type="number" min="1" step="1" value={form.adults} onChange={event => update('adults', event.target.value)} aria-label="Adultos" aria-invalid={!!errors.adults} aria-describedby={errors.adults ? 'adults-error' : undefined} /><button type="button" aria-label="Aumentar adultos" onClick={() => update('adults', String((Number(form.adults) || 1) + 1))}>+</button></div></div>{errors.adults && <p id="adults-error" className="field-error">{errors.adults}</p>}<Eyebrow>O QUE INSPIRA VOCÊ?</Eyebrow><div id="interest" className="interest-grid" role="radiogroup" onKeyDown={handleInterestKey} aria-label="Interesse da estadia">{services.map(service => <button type="button" role="radio" key={service.id} className="interest-card" aria-label={interestLabels[service.id]} tabIndex={form.interest === service.id ? 0 : -1} aria-checked={form.interest === service.id} onClick={() => update('interest', service.id)}><Media id={service.image} sizes="70px" /><span>{interestLabels[service.id]}</span>{form.interest === service.id && <><motion.div className="interest-selection" layoutId="selected-interest" transition={{ type: 'spring', stiffness: 340, damping: 30 }} /><i aria-hidden="true">✓</i></>}</button>)}</div>{errors.interest && <p className="field-error">{errors.interest}</p>}</>}
        {step === 2 && <div className="wizard-summary">{details}<p className="fine-print">Esta é uma consulta demonstrativa. As datas não representam disponibilidade.</p></div>}
      </motion.div></AnimatePresence>
      {!result && <div className="wizard-actions">{step > 0 && <button className="text-button" type="button" onClick={() => changeStep(step - 1)}>← Voltar</button>}<SpecularButton type="submit" size="md" radius={28} tint="#173e37" tintOpacity={1} textColor="#ffffff" lineColor="#d8c79f" baseColor="#78998c" intensity={1.6} autoAnimate={!stopped} followMouse={!stopped}>{step === 2 ? 'Montar minha consulta' : 'Continuar'} <span aria-hidden="true">↗</span></SpecularButton></div>}
    </form>
    <AnimatePresence>{result && <motion.div className="wizard-success" ref={summary} tabIndex={-1} role="status" initial={{ opacity: 0, y: stopped ? 0 : 18 }} animate={{ opacity: 1, y: 0 }}><motion.span className="success-mark" initial={{ scale: stopped ? 1 : 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>✓</motion.span><Eyebrow>SUA CONSULTA DEMONSTRATIVA</Eyebrow><h3>Um primeiro passo<br />para desacelerar.</h3><div className="wizard-summary">{details}</div><p>Preferências organizadas apenas nesta página. Nenhuma reserva foi realizada e nenhum dado foi enviado.</p><button className="text-button" type="button" onClick={() => { setResult(false); changeStep(0); }}>Editar minhas preferências ←</button></motion.div>}</AnimatePresence>
  </div>;
}
