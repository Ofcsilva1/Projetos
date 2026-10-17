import type { CSSProperties } from 'react';
import { imageUrl, media, type ImageId } from '../data/content';
export function Media({ id, priority = false, className = '', style, sizes = '(max-width: 640px) 100vw, (max-width: 960px) 80vw, 60vw' }: { id: ImageId; priority?: boolean; className?: string; style?: CSSProperties; sizes?: string }) {
  return <img className={`media ${className}`} src={imageUrl(id)} srcSet={`${imageUrl(id, 640)} 640w, ${imageUrl(id, 1280)} 1280w, ${imageUrl(id, 1920)} ${id === 'aerea' ? 1672 : 1920}w`} sizes={sizes} alt={media[id].alt} width={id === 'aerea' ? 1672 : 2752} height={id === 'aerea' ? 941 : 1536} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" style={style} />;
}
