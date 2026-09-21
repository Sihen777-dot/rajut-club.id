import { Link } from 'react-router-dom';
import SafeImg from '../SafeImg';
import { formatTanggal } from '../../utils';

export default function ArtikelCard({ artikel }) {
  return (
    <Link to={`/artikel/${artikel.id}`} className="card-hover artikel-card text-decoration-none text-dark d-block h-100">
      <div className="product-img-wrap">
        <SafeImg src={artikel.gambar} alt={artikel.judul} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div className="product-body">
        <div className="product-cat">Artikel</div>
        <h3 className="product-name">{artikel.judul}</h3>
        <p className="text-muted small mb-3" style={{ lineHeight: 1.5 }}>
          {(artikel.ringkasan || artikel.isi || '').slice(0, 90)}
          {(artikel.ringkasan || artikel.isi || '').length > 90 ? '…' : ''}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="text-muted small">{formatTanggal(artikel.created_at)}</span>
          <span className="link-more small">Baca →</span>
        </div>
      </div>
    </Link>
  );
}
