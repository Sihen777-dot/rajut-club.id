
import { mediaUrl } from '../utils';

export default function SafeImg({ src, alt, className, style }) {
  return (
    <img
      src={mediaUrl(src)}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
    />
  );
}