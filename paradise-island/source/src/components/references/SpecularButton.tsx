'use client';

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import './SpecularButton.css';

export interface SpecularButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  glow?: number;
  speed?: number;
  followMouse?: boolean;
  autoAnimate?: boolean;
}

// The upstream source is retained in reference-sources. CSS preserves the
// specular interaction without the blank WebGL surface observed in review.
export default function SpecularButton({ children, size = 'md', radius = 28, tint = '#173e37', tintOpacity = 1, textColor = '#ffffff', lineColor = '#dccba4', baseColor = '#78998c', intensity = 1.5, glow = 1, speed = 0.45, followMouse = true, autoAnimate = false, className = '', style, onPointerMove, ...props }: SpecularButtonProps) {
  return <button {...props} type={props.type || 'button'} className={`specular-button specular-button--${size} specular-button--css ${autoAnimate ? 'specular-button--animated' : ''} ${className}`} style={{ '--sb-radius': `${radius}px`, '--sb-tint': tint, '--sb-tint-opacity': tintOpacity, '--sb-text-color': textColor, '--sb-line-color': lineColor, '--sb-base-color': baseColor, '--sb-intensity': intensity, '--sb-glow': glow, '--sb-speed': `${Math.max(2, 1 / Math.max(speed, 0.1))}s`, ...style } as CSSProperties} onPointerMove={event => {
    if (followMouse) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--sb-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      event.currentTarget.style.setProperty('--sb-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }
    onPointerMove?.(event);
  }}><span className="specular-button__rim" aria-hidden="true" /><span className="specular-button__label">{children}</span></button>;
}
