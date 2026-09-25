// pages/CartPage.jsx — Keranjang Belanja + Checkout
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SafeImg from '../components/SafeImg';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, labelMetodeBayar } from '../utils';
import { pembeliApi } from '../api';
import { METODE_BAYAR, SHIPPING, SITE } from '../constants';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalHarga } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({
    nama_pembeli: '',
    alamat_pembeli: '',
    phone_pembeli: '',
    metode_pembayaran: METODE_BAYAR[0],
    pengiriman: SHIPPING[0],
    catatan: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        nama_pembeli: `${user.nama_d || ''} ${user.nama_b || ''}`.trim() || f.nama_pembeli,
        alamat_pembeli: user.alamat || f.alamat_pembeli,
        phone_pembeli: user.phone || f.phone_pembeli,
      }));
    }
  }, [user]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateForm() {
    if (!form.nama_pembeli.trim()) return 'Nama penerima wajib diisi';
    if (!form.alamat_pembeli.trim()) return 'Alamat wajib diisi';
    if (!form.phone_pembeli.trim()) return 'No. HP wajib diisi';
    if (!/^[0-9+\-\s]{8,20}$/.test(form.phone_pembeli.trim())) {
      return 'Format nomor HP tidak valid (minimal 8 digit)';
    }
    return null;
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLoggedIn || !user) {
      navigate('/login?redirect=/keranjang');
      return;
    }

    if (user.role === 'admin') {
      setError('Akun admin tidak bisa membuat pesanan. Login sebagai pembeli.');
      return;
    }

    const errMsg = validateForm();
    if (errMsg) {
      setError(errMsg);
      return;
    }

    if (items.length === 0) {
      setError('Keranjang masih kosong');
      return;
    }

    setSubmitting(true);
    try {
      for (const item of items) {
        await pembeliApi.createPembelian({
          id_produk: item.id_produk,
          nama_pembeli: form.nama_pembeli.trim(),
          alamat_pembeli: form.alamat_pembeli.trim(),
          phone_pembeli: form.phone_pembeli.trim(),
          metode_pembayaran: form.metode_pembayaran,
          pengiriman: form.pengiriman,
          catatan: form.catatan.trim() || null,
          jumlah: item.qty,
        });
      }
      clearCart();
      setSuccess('Pesanan berhasil dibuat! Mengalihkan...');
      setTimeout(() => navigate('/akun/pesanan'), 1200);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Gagal membuat pesanan. Pastikan backend & database sudah jalan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <p className="section-label">Keranjang</p>
            <h1 className="section-title font-display mb-2">Keranjang Belanja</h1>
            <p className="text-muted">
              {totalItems > 0
                ? `${totalItems} item di keranjang`
                : 'Keranjang masih kosong'}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-4">Belum ada produk di keranjang.</p>
              <Link to="/toko" className="btn btn-brand">
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    {items.map((item) => (
                      <div
                        key={item.id_produk}
                        className="d-flex align-items-center gap-3 p-3 border-bottom flex-wrap"
                      >
                        <SafeImg
                          src={item.gambar}
                          alt={item.nama_produk}
                          className="rounded"
                          style={{ width: 72, height: 72, objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{item.nama_produk}</h6>
                          <p className="text-muted small mb-1">{item.kategori}</p>
                          <p className="fw-semibold text-brand mb-0">
                            {formatRupiah(item.harga)}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            className="form-control form-control-sm"
                            style={{ width: 70 }}
                            value={item.qty}
                            onChange={(e) => updateQty(item.id_produk, e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(item.id_produk)}
                            title="Hapus"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="text-end" style={{ minWidth: 100 }}>
                          <span className="fw-bold">
                            {formatRupiah(Number(item.harga) * item.qty)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <Link to="/toko" className="btn btn-outline-secondary btn-sm">
                    Lanjut Belanja
                  </Link>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-sm sticky-top" style={{ top: 90 }}>
                  <div className="card-body">
                    <h5 className="mb-3">Ringkasan Belanja</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Total Item</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="fw-semibold">Total Harga</span>
                      <span className="fw-bold text-brand fs-5">
                        {formatRupiah(totalHarga)}
                      </span>
                    </div>

                    {!showCheckout ? (
                      <button
                        type="button"
                        className="btn btn-brand w-100"
                        onClick={() => {
                          if (!isLoggedIn) {
                            navigate('/login?redirect=/keranjang');
                            return;
                          }
                          setShowCheckout(true);
                        }}
                      >
                        Checkout
                      </button>
                    ) : (
                      <form onSubmit={handleCheckout}>
                        <hr />
                        <h6 className="mb-3">Data Pengiriman</h6>

                        <div className="mb-2">
                          <label className="form-label small fw-semibold">Nama Penerima *</label>
                          <input
                            type="text"
                            name="nama_pembeli"
                            className="form-control form-control-sm"
                            value={form.nama_pembeli}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-semibold">Alamat *</label>
                          <textarea
                            name="alamat_pembeli"
                            className="form-control form-control-sm"
                            rows={2}
                            value={form.alamat_pembeli}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-semibold">No. HP *</label>
                          <input
                            type="tel"
                            name="phone_pembeli"
                            className="form-control form-control-sm"
                            value={form.phone_pembeli}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-semibold">Metode Bayar</label>
                          <select
                            name="metode_pembayaran"
                            className="form-select form-select-sm"
                            value={form.metode_pembayaran}
                            onChange={handleChange}
                          >
                            {METODE_BAYAR.map((m) => (
                              <option key={m} value={m}>{labelMetodeBayar(m)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-semibold">Pengiriman</label>
                          <select
                            name="pengiriman"
                            className="form-select form-select-sm"
                            value={form.pengiriman}
                            onChange={handleChange}
                          >
                            {SHIPPING.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold">Catatan</label>
                          <textarea
                            name="catatan"
                            className="form-control form-control-sm"
                            rows={2}
                            value={form.catatan}
                            onChange={handleChange}
                          />
                        </div>

                        {form.metode_pembayaran === 'transfer_bank' && (
                          <div className="alert alert-info small py-2">
                            Transfer ke:<br />
                            {SITE.nama_bank_a}: {SITE.no_rek_a}<br />
                            {SITE.nama_bank_b}: {SITE.no_rek_b}<br />
                            a.n. {SITE.nama_toko}
                          </div>
                        )}

                        {error && <p className="text-danger small">{error}</p>}
                        {success && <p className="text-success small">{success}</p>}

                        <button
                          type="submit"
                          className="btn btn-brand w-100"
                          disabled={submitting}
                        >
                          {submitting ? 'Memproses...' : 'Buat Pesanan'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm w-100 mt-1"
                          onClick={() => setShowCheckout(false)}
                        >
                          Batal
                        </button>
                      </form>
                    )}
                  </div>
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
