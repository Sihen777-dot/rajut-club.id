// pages/pembeli/PembeliPesananPage.jsx — COD / Transfer + upload bukti + batalkan pesanan
import { useState } from 'react';
import { pembeliApi } from '../../api';
import { usePembeliList } from '../../hooks';
import { SITE } from '../../constants';
import {
  formatRupiah,
  formatTanggal,
  labelStatusBayar,
  labelMetodeBayar,
  labelPengiriman,
  mediaUrl,
} from '../../utils';
import SafeImg from '../../components/SafeImg';

export default function PembeliPesananPage() {
  const { rows: pesanan, loading, error, reload } = usePembeliList(pembeliApi.getPembelian);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showSelesai, setShowSelesai] = useState(false);

  function qtyOf(p) {
    if (p.jumlah != null) return Number(p.jumlah) || 1;
    const m = String(p.catatan || '').match(/Jumlah:\s*(\d+)/i);
    return m ? Number(m[1]) : 1;
  }

  function totalOf(p) {
    const harga = Number(p.harga || p.produk_harga || 0);
    return harga * qtyOf(p);
  }

  function isTransfer(p) {
    return String(p.metode_pembayaran || '') === 'transfer_bank';
  }

  function isBatal(p) {
    return String(p.status || '').toLowerCase() === 'dibatalkan';
  }

  async function bayar(id, metode) {
    setBusyId(id);
    setMsg('');
    setErr('');
    try {
      await pembeliApi.updatePembelian(id, {
        metode_pembayaran: metode,
        pembayaran: 'Dibayar',
        status: 'Selesai',
      });
      setMsg('Pembayaran berhasil. Pesanan selesai.');
      reload();
    } catch (e) {
      setErr(e.message || 'Gagal memproses pembayaran');
    } finally {
      setBusyId(null);
    }
  }

  async function uploadBukti(id, file) {
    if (!file) return;
    setBusyId(id);
    setMsg('');
    setErr('');
    try {
      await pembeliApi.uploadBukti(id, file);
      setMsg('Bukti transfer berhasil diupload. Silakan klik Bayar.');
      reload();
    } catch (e) {
      setErr(e.message || 'Gagal upload bukti transfer');
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

  async function batalkanPesanan(id) {
    if (!window.confirm('Batalkan pesanan ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setBusyId(id);
    setMsg('');
    setErr('');
    try {
      await pembeliApi.updatePembelian(id, { status: 'Dibatalkan' });
      setMsg('Pesanan berhasil dibatalkan.');
      reload();
    } catch (e) {
      setErr(e.message || 'Gagal membatalkan pesanan');
    } finally {
      setBusyId(null);
    }
  }

  const aktif = pesanan.filter((p) => {
    const s = String(p.status).toLowerCase();
    return s !== 'selesai' && s !== 'dibatalkan';
  });
  const selesai = pesanan.filter((p) => {
    const s = String(p.status).toLowerCase();
    return s === 'selesai' || s === 'dibatalkan';
  });
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
          Riwayat ({selesai.length})
        </button>
      </div>

      {msg && <div className="alert alert-success py-2">{msg}</div>}
      {(error || err) && <div className="alert alert-danger py-2">{error || err}</div>}

      {loading ? (
        <p className="text-muted">Memuat...</p>
      ) : list.length === 0 ? (
        <p className="text-muted">
          {showSelesai ? 'Belum ada riwayat pesanan.' : 'Tidak ada pesanan aktif.'}
        </p>
      ) : (
        <div className="accordion" id="pesananAccordion">
          {list.map((p) => {
            const qty = qtyOf(p);
            const total = totalOf(p);
            const belumBayar = String(p.pembayaran || '').toLowerCase().includes('belum');
            const isSelesai = String(p.status).toLowerCase() === 'selesai';
            const batal = isBatal(p);
            const transfer = isTransfer(p);
            const punyaBukti = Boolean(p.foto_bukti);
            const bisaBatal =
              !isSelesai && !batal && String(p.status).toLowerCase() === 'menunggu';

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
                    <span
                      className={`badge me-2 ${
                        batal ? 'bg-danger' : isSelesai ? 'bg-success' : 'bg-secondary'
                      }`}
                    >
                      {p.status}
                    </span>
                  </button>
                </h2>
                <div id={`pesanan-${p.id}`} className="accordion-collapse collapse" data-bs-parent="#pesananAccordion">
                  <div className="accordion-body small">
                    <div className="row g-2 mb-3">
                      <div className="col-sm-6"><b>Jumlah:</b> {qty} produk</div>
                      <div className="col-sm-6"><b>Total:</b> {formatRupiah(total)}</div>
                      <div className="col-sm-6"><b>Status bayar:</b> {labelStatusBayar(p.pembayaran)}</div>
                      <div className="col-sm-6"><b>Metode:</b> {labelMetodeBayar(p.metode_pembayaran)}</div>
                      <div className="col-sm-6"><b>Pengiriman:</b> {labelPengiriman(p.pengiriman)}</div>
                      <div className="col-sm-6"><b>Status pesanan:</b> {p.status}</div>
                      <div className="col-12"><b>Penerima:</b> {p.nama_pembeli}</div>
                      <div className="col-12"><b>Alamat:</b> {p.alamat_pembeli || '-'}</div>
                      <div className="col-12"><b>No. HP:</b> {p.phone_pembeli || '-'}</div>
                      {p.catatan && (
                        <div className="col-12"><b>Catatan:</b> {p.catatan}</div>
                      )}
                    </div>

                    {!isSelesai && !batal && transfer && belumBayar && (
                      <div className="border-top pt-3 mb-2">
                        <div className="fw-semibold mb-2">Upload bukti transfer</div>
                        <div
                          className="p-2 rounded mb-2 small"
                          style={{ background: '#fdf6ee', border: '1px solid #f0d5b8' }}
                        >
                          Transfer ke {SITE.nama_bank_a} {SITE.no_rek_a} / {SITE.nama_bank_b}{' '}
                          {SITE.no_rek_b} a.n. {SITE.nama_toko}
                        </div>
                        {punyaBukti && (
                          <div className="mb-2">
                            <img
                              src={mediaUrl(p.foto_bukti)}
                              alt="Bukti transfer"
                              style={{ maxWidth: 180, borderRadius: 8, border: '1px solid #ddd' }}
                            />
                            <div className="text-success small mt-1">Bukti sudah diupload</div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-sm mb-2"
                          disabled={busyId === p.id}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadBukti(p.id, f);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    )}

                    {!isSelesai && !batal && belumBayar && (
                      <div className="border-top pt-3 mb-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-brand"
                          disabled={busyId === p.id || (transfer && !punyaBukti)}
                          onClick={() => bayar(p.id, transfer ? 'transfer_bank' : 'cash')}
                        >
                          {busyId === p.id ? 'Memproses…' : 'Bayar'}
                        </button>
                        {transfer && !punyaBukti && (
                          <p className="text-muted small mt-2 mb-0">
                            Upload bukti transfer dulu sebelum menekan Bayar.
                          </p>
                        )}
                        {!transfer && (
                          <p className="text-muted small mt-2 mb-0">
                            Pembayaran COD — klik Bayar setelah barang diterima / disepakati.
                          </p>
                        )}
                      </div>
                    )}

                    {punyaBukti && (
                      <div className="mb-2">
                        <b>Bukti transfer:</b>
                        <div className="mt-1">
                          <img
                            src={mediaUrl(p.foto_bukti)}
                            alt="Bukti"
                            style={{ maxWidth: 160, borderRadius: 8 }}
                          />
                        </div>
                      </div>
                    )}

                    {!isSelesai && !batal && !belumBayar && p.status === 'Menunggu' && (
                      <div className="border-top pt-3 mb-2">
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

                    {bisaBatal && (
                      <div className="border-top pt-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          disabled={busyId === p.id}
                          onClick={() => batalkanPesanan(p.id)}
                        >
                          {busyId === p.id ? 'Memproses…' : 'Batalkan pesanan'}
                        </button>
                        <p className="text-muted small mt-2 mb-0">
                          Hanya bisa dibatalkan selama status masih Menunggu.
                        </p>
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
