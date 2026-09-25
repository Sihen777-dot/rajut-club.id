import { Link } from 'react-router-dom';
import SafeImg from '../SafeImg';
import { formatRupiah } from '../../utils';
import { useCart } from '../../context/CartContext';

export default function ProdukCard({ produk, variant = 'menu' }) {
  const to = `/toko/${produk.id_produk}`;
  const { addItem } = useCart();

  function handleAddCart(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(produk, 1);
    // Feedback sederhana
    const btn = e.currentTarget;
    const old = btn.textContent;
    btn.textContent = '✓ Ditambahkan';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = old;
      btn.disabled = false;
    }, 1200);
  }

  return (
    <div className="card-hover text-decoration-none text-dark d-block h-100 position-relative">
      <Link to={to} className="text-decoration-none text-dark">
        <div className="product-img-wrap">
          <SafeImg
            src={produk.gambar}
            alt={produk.nama_produk}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {variant === 'menu' && <span className="badge-tersedia">Tersedia</span>}
        </div>
        <div className="product-body">
          <div className="product-cat">{produk.kategori}</div>
          <h3 className="product-name">{produk.nama_produk}</h3>
          <p className="text-muted small mb-2" style={{ lineHeight: 1.5 }}>
            {(produk.deskripsi || '').slice(0, 72)}
            {(produk.deskripsi || '').length > 72 ? '…' : ''}
          </p>
          <div className="product-price mb-2">{formatRupiah(produk.harga)}</div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          type="button"
          className="btn btn-sm btn-brand w-100"
          onClick={handleAddCart}
        >
          + Keranjang
        </button>
      </div>
    </div>
  );
}
