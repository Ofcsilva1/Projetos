import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { MotionConfig, useReducedMotion } from 'motion/react';

const MotionSettings = createContext({ paused: false, stopped: false, toggle: () => {} });
export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const stopped = paused || !!reduced;
  useEffect(() => {
    document.body.dataset.motionPaused = String(stopped);
    return () => { delete document.body.dataset.motionPaused; };
  }, [stopped]);
  return <MotionSettings.Provider value={{ paused, stopped, toggle: () => setPaused(value => !value) }}><MotionConfig reducedMotion={stopped ? 'always' : 'user'}>{children}</MotionConfig></MotionSettings.Provider>;
}
export const useMotionSettings = () => useContext(MotionSettings);
