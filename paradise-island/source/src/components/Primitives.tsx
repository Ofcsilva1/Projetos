import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'motion/react';
import { useMotionSettings } from './MotionSettings';
export function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>; }
export function TextLink({ to, children, light = false }: { to: string; children: ReactNode; light?: boolean }) { return <Link className={`text-link ${light ? 'light' : ''}`} to={to}>{children}<Arrow /></Link>; }
export function Eyebrow({ children }: { children: ReactNode }) { return <p className="eyebrow">{children}</p>; }
export function DrawCircle({ children }: { children: ReactNode }) {
  const { stopped } = useMotionSettings();
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref);
  return <span className="circle-word" ref={ref}>{children}<svg aria-hidden="true" viewBox="0 0 286 73" preserveAspectRatio="none"><motion.path initial={{ pathLength: 1 }} animate={{ pathLength: visible && !stopped ? [0, 1, 1, 0] : 1 }} transition={visible && !stopped ? { duration: 3.8, times: [0, 0.42, 0.82, 1], repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' } : { duration: 0 }} d="M142.293 1C106.854 16.8908 6.08202 7.17705 1.23654 43.3756C-2.10604 68.3466 29.5633 73.2652 122.688 71.7518C215.814 70.2384 316.298 70.689 275.761 38.0785C230.14 1.37835 97.0503 24.4575 52.9384 1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></span>;
}
