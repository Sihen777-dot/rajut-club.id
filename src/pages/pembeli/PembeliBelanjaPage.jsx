// pages/pembeli/PembeliBelanjaPage.jsx — pilih produk lalu isi form pembelian
// Bisa diakses langsung dengan ?produk=id (dari tombol "Pesan Sekarang" di ProductDetailPage)
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { pembeliApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { METODE_BAYAR, SHIPPING, SITE } from '../../constants';
import { formatRupiah, labelMetodeBayar, labelPengiriman } from '../../utils';
import SafeImg from '../../components/SafeImg';

const FORM_KOSONG = {
  nama_pembeli: '', alamat_pembeli: '', phone_pembeli: '',
  metode_pembayaran: METODE_BAYAR[0], pengiriman: SHIPPING[0], catatan: '',
  jumlah: 1,
};

export default function PembeliBelanjaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [produkList, setProdukList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(FORM_KOSONG);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    pembeliApi.getProduk()
      .then((res) => setProdukList(res.data || []))
      .catch((err) => setError(err.message || 'Gagal memuat produk'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const produkId = searchParams.get('produk');
    if (produkId && produkList.length > 0) {
      const found = produkList.find((p) => String(p.id_produk) === produkId);
      if (found) setSelected(found);
    }
  }, [searchParams, produkList]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, nama_pembeli: `${user.nama_d} ${user.nama_b}`, alamat_pembeli: user.alamat || '', phone_pembeli: user.phone || '' }));
    }
  }, [user]);

  function pilihProduk(produk) {
    setSelected(produk);
    setSearchParams({ produk: produk.id_produk });
  }

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await pembeliApi.createPembelian({ id_produk: selected.id_produk, ...form });
      setSuccess('Pesanan berhasil dibuat!');
      setTimeout(() => navigate('/akun/pesanan'), 1000);
    } catch (err) {
      setError(err.message || 'Gagal membuat pesanan');
    } finally { setSubmitting(false); }
  }

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h1 className="h3 fw-bold mb-4">Belanja</h1>

      {!selected ? (
        <div className="row row-cols-2 row-cols-md-4 g-3">
          {produkList.map((p) => (
            <div className="col" key={p.id_produk}>
              <div className="card h-100 border-0 shadow-sm" role="button" onClick={() => pilihProduk(p)}>
                <SafeImg src={p.gambar} alt={p.nama_produk} className="card-img-top" style={{ height: 120, objectFit: 'cover' }} />
                <div className="card-body p-2">
                  <p className="small fw-semibold mb-1">{p.nama_produk}</p>
                  <p className="small text-brand fw-bold mb-0">{formatRupiah(p.harga)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <SafeImg src={selected.gambar} alt={selected.nama_produk} className="card-img-top" style={{ height: 180, objectFit: 'cover' }} />
              <div className="card-body">
                <h2 className="h6">{selected.nama_produk}</h2>
                <p className="text-brand fw-bold">{formatRupiah(selected.harga)}</p>
                <button onClick={() => { setSelected(null); setSearchParams({}); }} className="btn btn-sm btn-outline-secondary">Ganti Produk</button>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h6 fw-bold mb-3">Form Pemesanan</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nama Penerima</label>
                    <input name="nama_pembeli" className="form-control" value={form.nama_pembeli} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Alamat Pengiriman</label>
                    <textarea name="alamat_pembeli" className="form-control" rows="2" value={form.alamat_pembeli} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">No. HP</label>
                    <input name="phone_pembeli" className="form-control" value={form.phone_pembeli} onChange={handleChange} required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Metode Pembayaran</label>
                      <select name="metode_pembayaran" className="form-select" value={form.metode_pembayaran} onChange={handleChange}>
                        {METODE_BAYAR.map((m) => <option key={m} value={m}>{labelMetodeBayar(m)}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Pengiriman</label>
                      <select name="pengiriman" className="form-select" value={form.pengiriman} onChange={handleChange}>
                        {SHIPPING.map((s) => <option key={s} value={s}>{labelPengiriman(s)}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Info rekening hanya saat Transfer Bank dipilih */}
                  {form.metode_pembayaran === 'transfer_bank' && (
                    <div className="mb-3 p-3 rounded" style={{ background: '#fdf6ee', border: '1px solid #f0d5b8' }}>
                      <p className="small fw-semibold mb-2 text-brand">Transfer ke rekening berikut</p>
                      <div className="row g-2 small">
                        <div className="col-sm-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Bank</span>
                            <span className="fw-semibold">{SITE.nama_bank_a}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">No. Rek</span>
                            <span className="fw-semibold">{SITE.no_rek_a}</span>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Bank</span>
                            <span className="fw-semibold">{SITE.nama_bank_b}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">No. Rek</span>
                            <span className="fw-semibold">{SITE.no_rek_b}</span>
                          </div>
                        </div>
                      </div>
                      <p className="small text-muted mb-0 mt-2">a.n. {SITE.nama_toko}</p>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Jumlah pesanan</label>
                    <input
                      type="number"
                      name="jumlah"
                      min={1}
                      className="form-control"
                      value={form.jumlah}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Catatan (opsional)</label>
                    <textarea name="catatan" className="form-control" rows="2" value={form.catatan} onChange={handleChange} />
                  </div>

                  {error && <p className="text-danger small">{error}</p>}
                  {success && <p className="text-success small">{success}</p>}

                  <button type="submit" disabled={submitting} className="btn btn-brand px-4">
                    {submitting ? 'Memproses...' : 'Buat Pesanan'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}