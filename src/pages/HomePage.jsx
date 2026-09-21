import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProdukCard from '../components/home/ProdukCard';
import ArtikelCard from '../components/home/ArtikelCard';
import { useBerandaData } from '../hooks';


export default function HomePage() {
  const { produk, artikelTampil, loading, error } = useBerandaData();
  const list = Array.isArray(produk) ? produk : [];
  const produkTampil = list.slice(0, 3);
  const artikelList = Array.isArray(artikelTampil) ? artikelTampil : [];

  return (
    <>
      <Header />

      <section className="hero-section">
        <div className="container py-5">
          <span className="hero-badge">Est. Handmade · Pacitan</span>
          <h1 className="hero-title">Rajut Club</h1>
          <div className="hero-line" />
          <p className="hero-sub">
            “Kehangatan yang dirajut dengan tangan,<br />untuk momen yang istimewa.”
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/toko" className="btn-brand">Lihat Koleksi</Link>
            <Link to="/artikel" className="btn-outline-light">Cerita Kami</Link>
          </div>
        </div>
      </section>

      <section className="py-4" style={{ background: 'var(--surface)' }}>
        <div className="container text-center py-2">
          <p
            className="font-display mx-auto mb-0"
            style={{
              fontSize: 'clamp(1.15rem, 2.2vw, 1.5rem)',
              maxWidth: 520,
              lineHeight: 1.45,
              color: 'var(--ink-2)',
              fontStyle: 'italic',
            }}
          >
            Kami merajut bukan sekadar produk — melainkan kehangatan yang bisa kamu sentuh dan kenakan.
          </p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <p className="section-label">Koleksi</p>
            <h2 className="section-title">Pilihan istimewa</h2>
          </div>
          {error && (
            <p className="text-center text-danger mb-3">{error}</p>
          )}
          {loading ? (
            <p className="text-muted text-center">Memuat produk...</p>
          ) : produkTampil.length === 0 ? (
            <p className="text-muted text-center">Belum ada produk. Pastikan backend & database aktif.</p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
              {produkTampil.map((p) => (
                <div className="col" key={p.id_produk || p.nama_produk}>
                  <ProdukCard produk={p} variant="home" />
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/toko" className="btn-outline-brand">Semua produk</Link>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <p className="section-label">Jurnal</p>
            <h2 className="section-title">Dari meja rajut</h2>
          </div>
          {!loading && artikelList.length > 0 && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
              {artikelList.map((a) => (
                <div className="col" key={a.id || a.judul}>
                  <ArtikelCard artikel={a} />
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/artikel" className="link-more">Baca semua artikel →</Link>
          </div>
        </div>
      </section>

      <section className="pb-5 mb-2">
        <div className="container">
          <div className="cta-band">
            <p className="section-label mb-2">Undang kehangatan</p>
            <h2 className="section-title mb-3">Temukan potongan yang tepat untukmu</h2>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: 400 }}>
              Sweater, tas, aksesoris, dan mainan — semua handmade di Pacitan.
            </p>
            <Link to="/toko" className="btn-brand">Jelajahi koleksi</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
