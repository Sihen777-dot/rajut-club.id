import { useMemo, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProdukCard from '../components/home/ProdukCard';
import { KATEGORI_PRODUK } from '../constants';
import { useBerandaData } from '../hooks';

export default function TokoPage() {
  const { produk, loading, error } = useBerandaData();
  const [kategori, setKategori] = useState(''); // '' = semua
  const [search, setSearch] = useState('');

  const produkTampil = useMemo(() => {
    let list = produk || [];

    // Filter kategori
    if (kategori) {
      list = list.filter((p) => p.kategori === kategori);
    }

    // Pencarian produk (nama / deskripsi)
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          (p.nama_produk || '').toLowerCase().includes(q) ||
          (p.deskripsi || '').toLowerCase().includes(q) ||
          (p.kategori || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [produk, kategori, search]);

  return (
    <>
      <Header />
      <section className="py-5">
        <div className="container text-center mb-4">
          <p className="section-label">Toko</p>
          <h1 className="section-title font-display mb-2">Koleksi Rajut Club</h1>
          <p className="text-muted mb-0 mx-auto" style={{ maxWidth: 440 }}>
            Pilih produk handmade favoritmu — hangat, unik, dan dibuat dengan teliti.
          </p>
        </div>

        <div className="container">
          {/* Pencarian Produk */}
          <div className="row justify-content-center mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                  🔍
                </span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Cari produk (nama, kategori)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Pencarian produk"
                />
                {search && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSearch('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Kategori */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
            <button
              type="button"
              className={`cat-pill ${kategori === '' ? 'active' : ''}`}
              onClick={() => setKategori('')}
            >
              Semua
            </button>
            {KATEGORI_PRODUK.map((k) => (
              <button
                key={k}
                type="button"
                className={`cat-pill ${kategori === k ? 'active' : ''}`}
                onClick={() => setKategori(k)}
              >
                {k}
              </button>
            ))}
          </div>

          {error && <p className="text-danger text-center">{error}</p>}
          {loading ? (
            <p className="text-center text-muted">Memuat produk...</p>
          ) : produkTampil.length === 0 ? (
            <p className="text-center text-muted">
              {search
                ? `Tidak ada produk yang cocok dengan “${search}”.`
                : 'Belum ada produk di kategori ini.'}
            </p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {produkTampil.map((p) => (
                <div className="col" key={p.id_produk}>
                  <ProdukCard produk={p} variant="menu" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
