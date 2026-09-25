import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SafeImg from '../components/SafeImg';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isLoggedIn, isPembeli } = useAuth();
  const { addItem } = useCart();
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.getProdukById(id)
      .then((res) => setProduk(res.data))
      .catch((e) => setError(e.message || 'Produk tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddCart() {
    if (!produk) return;
    addItem(produk, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <>
      <Header />
      <section className="bg-cream py-5">
        <div className="container">
          <Link to="/toko" className="text-brand text-decoration-none small fw-semibold">
            ← Kembali ke produk
          </Link>
          {loading && <p className="mt-4 text-muted">Memuat...</p>}
          {error && <p className="mt-4 text-danger">{error}</p>}
          {produk && (
            <div className="row g-4 align-items-start mt-2">
              <div className="col-md-6">
                <SafeImg
                  src={produk.gambar}
                  alt={produk.nama_produk}
                  className="w-100 rounded-4 shadow-sm"
                  style={{ height: 420, objectFit: 'cover' }}
                />
              </div>
              <div className="col-md-6">
                <span className="text-brand small fw-semibold">{produk.kategori}</span>
                <h1 className="fw-bold mt-1 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  {produk.nama_produk}
                </h1>
                <p className="text-brand fs-3 fw-bold mb-3">{formatRupiah(produk.harga)}</p>
                <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>{produk.deskripsi}</p>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <label className="small fw-semibold mb-0">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    style={{ width: 80 }}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </div>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-brand px-4 py-2"
                    onClick={handleAddCart}
                  >
                    {added ? '✓ Ditambahkan ke Keranjang' : '+ Tambah ke Keranjang'}
                  </button>

                  {isLoggedIn && isPembeli && (
                    <Link
                      to={`/akun/belanja?produk=${produk.id_produk}`}
                      className="btn btn-outline-secondary px-4 py-2"
                    >
                      Pesan Langsung
                    </Link>
                  )}
                  {!isLoggedIn && (
                    <Link to="/login" className="btn btn-outline-secondary px-4 py-2">
                      Masuk untuk Pesan Langsung
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
