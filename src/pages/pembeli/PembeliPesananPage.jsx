// pages/pembeli/PembeliPesananPage.jsx — bayar (cash/qris) → status Selesai
import { useState } from 'react';
import { pembeliApi } from '../../api';
import { usePembeliList } from '../../hooks';
import {
  formatRupiah,
  formatTanggal,
  labelStatusBayar,
  labelMetodeBayar,
  labelPengiriman,
} from '../../utils';
import SafeImg from '../../components/SafeImg';

export default function PembeliPesananPage() {
  const { rows: pesanan, loading, error, reload } = usePembeliList(pembeliApi.getPembelian);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showSelesai, setShowSelesai] = useState(false);

  async function bayar(id, metode) {
    setBusyId(id);
    setMsg('');
    setErr('');
    try {
      // Setelah bayar → Dibayar + Selesai (pesanan selesai)
      await pembeliApi.updatePembelian(id, {
        metode_pembayaran: metode,
        pembayaran: 'Dibayar',
        status: 'Selesai',
      });
      setMsg(`Pembayaran ${metode === 'qris' ? 'QRIS' : 'Cash'} berhasil. Pesanan selesai.`);
      reload();
    } catch (e) {
      setErr(e.message || 'Gagal memproses pembayaran');
    } finally {
      setBusyId(null);
    }
  }

  async function konfirmasiDiterima(id) {
    setBusyId(id);
    setMsg('');
    setErr('');
    try {
      await pembeliApi.updatePembelian(id, { status: 'Diterima' });
      setMsg('Pesanan dikonfirmasi diterima.');
      reload();
    } catch (e) {
      setErr(e.message || 'Gagal mengubah status');
    } finally {
      setBusyId(null);
    }
  }

  function qtyOf(p) {
    if (p.jumlah != null) return Number(p.jumlah) || 1;
    const m = String(p.catatan || '').match(/Jumlah:\s*(\d+)/i);
    return m ? Number(m[1]) : 1;
  }

  function totalOf(p) {
    const harga = Number(p.harga || p.produk_harga || 0);
    return harga * qtyOf(p);
  }

  const aktif = pesanan.filter((p) => String(p.status).toLowerCase() !== 'selesai');
  const selesai = pesanan.filter((p) => String(p.status).toLowerCase() === 'selesai');
  const list = showSelesai ? selesai : aktif;

  return (
    <div>
      <p className="text-secondary mb-3">Riwayat pesanan, pembayaran, dan status.</p>

      <div className="d-flex gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm ${!showSelesai ? 'btn-brand' : 'btn-outline-secondary'}`}
          onClick={() => setShowSelesai(false)}
        >
          Aktif ({aktif.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${showSelesai ? 'btn-brand' : 'btn-outline-secondary'}`}
          onClick={() => setShowSelesai(true)}
        >
          Selesai ({selesai.length})
        </button>
      </div>

      {msg && <div className="alert alert-success py-2">{msg}</div>}
      {(error || err) && <div className="alert alert-danger py-2">{error || err}</div>}
      {loading ? (
        <p className="text-muted">Memuat...</p>
      ) : list.length === 0 ? (
        <p className="text-muted">
          {showSelesai ? 'Belum ada pesanan selesai.' : 'Tidak ada pesanan aktif.'}
        </p>
      ) : (
        <div className="accordion" id="pesananAccordion">
          {list.map((p) => {
            const qty = qtyOf(p);
            const total = totalOf(p);
            const belumBayar = String(p.pembayaran || '').toLowerCase().includes('belum');
            const isSelesai = String(p.status).toLowerCase() === 'selesai';

            return (
              <div className="accordion-item border-0 shadow-sm mb-2 rounded overflow-hidden" key={p.id}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#pesanan-${p.id}`}
                  >
                    <SafeImg
                      src={p.produk_gambar || p.gambar}
                      alt={p.nama_produk}
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, marginRight: 12 }}
                    />
                    <div className="flex-fill text-start">
                      <div className="fw-semibold">{p.nama_produk}</div>
                      <div className="small text-muted">
                        {formatTanggal(p.created_at)} · {qty} item · {formatRupiah(total)}
                      </div>
                    </div>
                    <span className={`badge me-2 ${isSelesai ? 'bg-success' : 'bg-secondary'}`}>
                      {p.status}
                    </span>
                  </button>
                </h2>
                <div id={`pesanan-${p.id}`} className="accordion-collapse collapse" data-bs-parent="#pesananAccordion">
                  <div className="accordion-body small">
                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <b>Jumlah pesanan:</b> {qty} produk
                      </div>
                      <div className="col-sm-6">
                        <b>Total:</b> {formatRupiah(total)}
                      </div>
                      <div className="col-sm-6">
                        <b>Status Pembayaran:</b> {labelStatusBayar(p.pembayaran)}
                      </div>
                      <div className="col-sm-6">
                        <b>Metode:</b> {labelMetodeBayar(p.metode_pembayaran)}
                      </div>
                      <div className="col-sm-6">
                        <b>Pengiriman:</b> {labelPengiriman(p.pengiriman)}
                      </div>
                      <div className="col-sm-6">
                        <b>Status pesanan:</b> {p.status}
                      </div>
                      <div className="col-12">
                        <b>Nama Penerima:</b> {p.nama_pembeli}
                      </div>
                      <div className="col-12">
                        <b>Alamat:</b> {p.alamat_pembeli || '-'}
                      </div>
                      <div className="col-12">
                        <b>No. HP:</b> {p.phone_pembeli || '-'}
                      </div>
                      <div className="col-12">
                        <b>Catatan:</b> {p.catatan || '-'}
                      </div>
                    </div>

                    {!isSelesai && belumBayar && (
                      <div className="border-top pt-3 mb-2">
                        <div className="fw-semibold mb-2">Bayar sekarang</div>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-brand"
                            disabled={busyId === p.id}
                            onClick={() => bayar(p.id, 'cash')}
                          >
                            Bayar Cash
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-brand"
                            disabled={busyId === p.id}
                            onClick={() => bayar(p.id, 'qris')}
                          >
                            Bayar QRIS
                          </button>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          Setelah bayar, pesanan otomatis berstatus <b>Selesai</b>.
                        </p>
                      </div>
                    )}

                    {!isSelesai && !belumBayar && p.status === 'Menunggu' && (
                      <div className="border-top pt-3">
                        <div className="fw-semibold mb-2">Status pesanan</div>
                        <button
                          type="button"
                          className="btn btn-sm btn-dark"
                          disabled={busyId === p.id}
                          onClick={() => konfirmasiDiterima(p.id)}
                        >
                          Tandai Diterima
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
