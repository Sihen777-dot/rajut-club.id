/**
 * [buatan] Kelola pesanan/pembelian.
 * URL: `/admin/pembelian` — ubah status proses & pembayaran.
 */
import { useState } from 'react';
import { adminApi } from '../../api';
import { useAdminList } from '../../hooks';
import { useAdminGuard } from '../../hooks';
import { METODE_BAYAR, SHIPPING, STATUS_BAYAR, STATUS_PROSES } from '../../constants';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import DetailDl from '../../components/admin/DetailDl';
import { formatRupiah, formatTanggal, labelMetodeBayar, labelStatusBayar, labelPengiriman } from '../../utils';
import { mediaUrl } from '../../utils';
import { SITE } from '../../constants';

export default function AdminPembelianPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getPembelian);
  const [modal, setModal] = useState(null); // edit status pesanan
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({}); // status proses & pembayaran
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openDetail = async (row) => {
    try {
      const r = await adminApi.getPembelianById(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    try {
      const r = await adminApi.getPembelianById(row.id);
      const p = r.data;
      setForm({
        metode_pembayaran: p.metode_pembayaran ?? METODE_BAYAR[0],
        pembayaran: p.pembayaran ?? STATUS_BAYAR[0],
        pengiriman: p.pengiriman ?? SHIPPING[0],
        status: p.status ?? STATUS_PROSES[0],
        catatan: p.catatan || '',
      });
      setModal({ id: row.id, row: p });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updatePembelian(modal.id, form);
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus pesanan ini?')) return;
    try {
      await adminApi.deletePembelian(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader title="Daftar pesanan" subtitle={`${rows.length} transaksi`} />
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pembeli</th>
                <th>Gambar</th>
                <th>Produk</th>
                <th>Total</th>
                <th>Status</th>
                <th>Bayar</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-secondary">
                    Belum ada pesanan.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                <tr key={row.id}>
                  <td>#{row.id}</td>
                  <td>
                    <div>{row.nama_pembeli}</div>
                    <small className="text-secondary">{row.email_pembeli || row.uname_pembeli}</small>
                  </td>
                  <td>
                    <img
                      src={mediaUrl((row.produk_gambar || row.gambar_produk))}
                      alt={row.nama_produk}
                      width={48}
                      height={48}
                      className="admin-thumb"
                    />
                  </td>
                  <td>{row.nama_produk}</td>
                  <td>{formatRupiah(row.harga)}</td>
                  <td>
                    <span className="admin-badge">{row.status}</span>
                  </td>
                  <td>
                    <div>{row.pembayaran}</div>
                    {row.foto_bukti && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle mt-1" style={{ fontSize: 11 }}>
                        Ada bukti TF
                      </span>
                    )}
                  </td>
                  <td className="col-actions">
                    <AdminRowActions
                      onDetail={() => openDetail(row)}
                      onEdit={() => openEdit(row)}
                      onDelete={() => onDelete(row.id)}
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail pesanan #${detail.id}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <div className="d-flex justify-content-end mb-3 no-print">
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1" /> Cetak struk
              </button>
            </div>

            {/* Tampilan layar: detail + bukti transfer */}
            <div className="no-print">
              <div className="row g-3 mb-4">
                <div className="col-sm-5">
                  <p className="small text-secondary mb-1">Produk</p>
                  <img
                    src={mediaUrl(detail.produk_gambar || detail.gambar_produk)}
                    alt={detail.nama_produk}
                    className="admin-detail-img w-100"
                  />
                </div>
                <div className="col-sm-7">
                  <p className="small text-secondary mb-1">Bukti transfer</p>
                  {detail.foto_bukti ? (
                    <img
                      src={mediaUrl(detail.foto_bukti)}
                      alt="Bukti transfer"
                      className="admin-detail-img w-100"
                      style={{ maxHeight: 280, objectFit: 'contain', background: '#f8f8f8' }}
                    />
                  ) : (
                    <div className="text-secondary small border rounded p-3">
                      Belum ada bukti transfer diupload.
                    </div>
                  )}
                </div>
              </div>
              <DetailDl
                items={[
                  ['ID pesanan', detail.id],
                  ['Pembeli', detail.nama_pembeli],
                  ['Email', detail.email_pembeli],
                  ['Produk', detail.nama_produk],
                  ['Kategori', detail.kategori_produk || detail.kategori || '—'],
                  ['Qty', detail.jumlah || detail.qty || 1],
                  ['Harga satuan', formatRupiah(detail.harga)],
                  [
                    'Total',
                    formatRupiah(
                      (Number(detail.harga) || 0) * (Number(detail.jumlah || detail.qty) || 1)
                    ),
                  ],
                  ['Alamat kirim', detail.alamat_pembeli],
                  ['Telepon', detail.phone_pembeli],
                  ['Metode bayar', labelMetodeBayar(detail.metode_pembayaran)],
                  ['Status bayar', labelStatusBayar(detail.pembayaran)],
                  ['Kurir', labelPengiriman(detail.pengiriman)],
                  ['Status pesanan', detail.status],
                  ['Catatan', detail.catatan || '—'],
                  ['Tanggal', formatTanggal(detail.created_at)],
                ]}
              />
            </div>

            {/* Struk cetak (hanya admin) */}
            <div className="print-only admin-struk">
              <div className="struk-header">
                <h2>{SITE.nama_toko}</h2>
                <p>{SITE.tagline}</p>
                <p className="struk-meta">Struk Pesanan #{detail.id}</p>
                <p className="small">Dicetak: {formatTanggal(new Date())}</p>
              </div>
              <hr />
              <table className="struk-table">
                <tbody>
                  <tr>
                    <td>Tanggal</td>
                    <td>{formatTanggal(detail.created_at)}</td>
                  </tr>
                  <tr>
                    <td>Pembeli</td>
                    <td>{detail.nama_pembeli || '—'}</td>
                  </tr>
                  <tr>
                    <td>No. HP</td>
                    <td>{detail.phone_pembeli || '—'}</td>
                  </tr>
                  <tr>
                    <td>Alamat</td>
                    <td>{detail.alamat_pembeli || '—'}</td>
                  </tr>
                </tbody>
              </table>
              <hr />
              <table className="struk-table struk-items">
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{detail.nama_produk}</td>
                    <td>{detail.jumlah || detail.qty || 1}</td>
                    <td>{formatRupiah(detail.harga)}</td>
                    <td>
                      {formatRupiah(
                        (Number(detail.harga) || 0) * (Number(detail.jumlah || detail.qty) || 1)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              <hr />
              <table className="struk-table">
                <tbody>
                  <tr>
                    <td>Metode</td>
                    <td>{labelMetodeBayar(detail.metode_pembayaran)}</td>
                  </tr>
                  <tr>
                    <td>Status bayar</td>
                    <td>{labelStatusBayar(detail.pembayaran)}</td>
                  </tr>
                  <tr>
                    <td>Pengiriman</td>
                    <td>{labelPengiriman(detail.pengiriman)}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{detail.status}</td>
                  </tr>
                  <tr className="struk-total">
                    <td>Total bayar</td>
                    <td>
                      {formatRupiah(
                        (Number(detail.harga) || 0) * (Number(detail.jumlah || detail.qty) || 1)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {detail.foto_bukti && (
                <>
                  <hr />
                  <p className="small mb-1">Bukti transfer:</p>
                  <img
                    src={mediaUrl(detail.foto_bukti)}
                    alt="Bukti transfer"
                    style={{ maxWidth: 220, maxHeight: 160, objectFit: 'contain' }}
                  />
                </>
              )}
              <p className="struk-footer">Terima kasih — {SITE.nama_toko}</p>
            </div>

            <style>{`
              .print-only { display: none; }
              @media print {
                body * { visibility: hidden !important; }
                .print-only, .print-only * { visibility: visible !important; }
                .print-only {
                  display: block !important;
                  position: absolute;
                  left: 0; top: 0; width: 100%;
                  padding: 24px;
                  background: #fff;
                }
                .no-print, .admin-sidebar, aside, header, .btn, nav { display: none !important; }
                .struk-header { text-align: center; }
                .struk-header h2 { margin: 0; font-size: 1.25rem; }
                .struk-header p { margin: 2px 0; font-size: 0.85rem; color: #555; }
                .struk-meta { font-weight: 600; }
                .struk-table { width: 100%; max-width: 420px; margin: 0 auto; border-collapse: collapse; font-size: 0.9rem; }
                .struk-table td, .struk-table th { padding: 4px 0; vertical-align: top; }
                .struk-table td:last-child, .struk-table th:last-child { text-align: right; }
                .struk-items th { border-bottom: 1px solid #ccc; text-align: left; }
                .struk-total td { font-weight: 700; font-size: 1rem; padding-top: 8px; }
                .struk-footer { text-align: center; margin-top: 20px; font-size: 0.85rem; color: #555; }
                hr { border: none; border-top: 1px dashed #999; margin: 12px auto; max-width: 420px; }
              }
            `}</style>
          </>
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title={`Ubah pesanan #${modal?.id}`} onClose={() => setModal(null)} wide>
        {modal?.row && (
          <div className="mb-3 small text-secondary">
            <p className="mb-2">
              {modal.row.nama_pembeli} · {modal.row.nama_produk} · {formatTanggal(modal.row.created_at)}
            </p>
            <div className="d-flex flex-wrap gap-3 align-items-start">
              <img
                src={mediaUrl(modal.row.produk_gambar || modal.row.gambar_produk)}
                alt={modal.row.nama_produk}
                width={72}
                height={72}
                className="admin-thumb"
              />
              {modal.row.foto_bukti && (
                <img src={mediaUrl(modal.row.foto_bukti)} alt="Bukti" className="admin-upload-preview" width={120} />
              )}
            </div>
          </div>
        )}
        <form onSubmit={onSave}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Metode bayar</label>
              <select className="form-select" value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}>
                {METODE_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status pembayaran</label>
              <select className="form-select" value={form.pembayaran} onChange={(e) => setForm({ ...form, pembayaran: e.target.value })}>
                {STATUS_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Kurir</label>
              <select className="form-select" value={form.pengiriman} onChange={(e) => setForm({ ...form, pengiriman: e.target.value })}>
                {SHIPPING.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status pesanan</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_PROSES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Catatan</label>
              <textarea className="form-control" rows={2} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-dark rounded-0 w-100 mt-2" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}
