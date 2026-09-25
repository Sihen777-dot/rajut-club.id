import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ArtikelCard from '../components/home/ArtikelCard';
import { useBerandaData } from '../hooks';

export default function ArtikelListPage() {
  const { artikel, loading, error } = useBerandaData();

  return (
    <>
      <Header />
      <section className="py-5">
        <div className="container">
          <p className="section-label">Cerita</p>
          <h1 className="section-title font-display mb-4">Dari meja rajut</h1>
          {error && <p className="text-danger">{error}</p>}
          {loading ? (
            <p className="text-muted">Memuat artikel...</p>
          ) : (artikel || []).length === 0 ? (
            <p className="text-muted">Belum ada artikel.</p>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
              {(artikel || []).map((a) => (
                <div className="col" key={a.id}>
                  <ArtikelCard artikel={a} />
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
