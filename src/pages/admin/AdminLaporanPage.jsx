/**
 * Laporan Penjualan — filter tanggal/periode/kategori, rekap total, cetak laporan.
 * Sesuai rubrik: Menampilkan transaksi, Rekap total, Filter, Cetak laporan.
 */
import { useMemo, useState } from 'react';
import { adminApi } from '../../api';
import { useAdminList, useAdminGuard } from '../../hooks';
import { KATEGORI_PRODUK, STATUS_BAYAR, STATUS_PROSES } from '../../constants';
import { SITE } from '../../constants';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import { formatRupiah, formatTanggal } from '../../utils';

function toDateInput(d) {
  if (!d) return '';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '';
  return x.toISOString().slice(0, 10);
}

function rowTotal(row) {
  const harga = Number(row.harga) || 0;
  const qty = Number(row.jumlah || row.qty) || 1;
  return harga * qty;
}

function isPaid(row) {
  const p = String(row.pembayaran || row.status_bayar || '').toLowerCase();
  return p === 'dibayar' || p.includes('lunas');
}

export default function AdminLaporanPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error } = useAdminList(adminApi.getPembelian);

  const [filter, setFilter] = useState({
    dari: '',
    sampai: '',
    status: '',
    pembayaran: '',
    kategori: '',
  });

  const filtered = useMemo(() => {
    let list = Array.isArray(rows) ? [...rows] : [];

    if (filter.dari) {
      const dari = new Date(filter.dari);
      dari.setHours(0, 0, 0, 0);
      list = list.filter((r) => {
        const t = new Date(r.created_at);
        return !isNaN(t.getTime()) && t >= dari;
      });
    }
    if (filter.sampai) {
      const sampai = new Date(filter.sampai);
      sampai.setHours(23, 59, 59, 999);
      list = list.filter((r) => {
        const t = new Date(r.created_at);
        return !isNaN(t.getTime()) && t <= sampai;
      });
    }
    if (filter.status) {
      list = list.filter((r) => String(r.status) === filter.status);
    }
    if (filter.pembayaran) {
      list = list.filter((r) => String(r.pembayaran || r.status_bayar) === filter.pembayaran);
    }
    if (filter.kategori) {
      list = list.filter(
        (r) => String(r.kategori_produk || r.kategori || '') === filter.kategori
      );
    }
    return list;
  }, [rows, filter]);

  const rekap = useMemo(() => {
    const totalTransaksi = filtered.length;
    const totalItem = filtered.reduce((s, r) => s + (Number(r.jumlah || r.qty) || 1), 0);
    const totalSemua = filtered.reduce((s, r) => s + rowTotal(r), 0);
    const dibayar = filtered.filter(isPaid);
    const totalPendapatan = dibayar.reduce((s, r) => s + rowTotal(r), 0);
    const belumBayar = filtered.filter((r) => !isPaid(r)).length;

    // per kategori
    const byKat = {};
    filtered.forEach((r) => {
      const k = r.kategori_produk || r.kategori || 'Lainnya';
      if (!byKat[k]) byKat[k] = { jumlah: 0, total: 0 };
      byKat[k].jumlah += 1;
      byKat[k].total += rowTotal(r);
    });

    // per status
    const byStatus = {};
    filtered.forEach((r) => {
      const s = r.status || '—';
      if (!byStatus[s]) byStatus[s] = 0;
      byStatus[s] += 1;
    });

    return {
      totalTransaksi,
      totalItem,
      totalSemua,
      totalPendapatan,
      belumBayar,
      byKat,
      byStatus,
    };
  }, [filtered]);

  function resetFilter() {
    setFilter({ dari: '', sampai: '', status: '', pembayaran: '', kategori: '' });
  }

  function setPeriode(days) {
    const sampai = new Date();
    const dari = new Date();
    dari.setDate(dari.getDate() - days);
    setFilter((f) => ({
      ...f,
      dari: toDateInput(dari),
      sampai: toDateInput(sampai),
    }));
  }

  function handleCetak() {
    window.print();
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="laporan-page">
      <PageHeader
        title="Laporan Penjualan"
        subtitle="Filter, rekap total, dan cetak laporan transaksi"
      />
      {error && <div className="alert alert-danger no-print">{error}</div>}

      {/* FILTER */}
      <div className="admin-panel mb-4 no-print">
        <h2 className="admin-section-title mb-3">Filter laporan</h2>
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label">Dari tanggal</label>
            <input
              type="date"
              className="form-control"
              value={filter.dari}
              onChange={(e) => setFilter({ ...filter, dari: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Sampai tanggal</label>
            <input
              type="date"
              className="form-control"
              value={filter.sampai}
              onChange={(e) => setFilter({ ...filter, sampai: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Status pesanan</label>
            <select
              className="form-select"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">Semua</option>
              {STATUS_PROSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Status bayar</label>
            <select
              className="form-select"
              value={filter.pembayaran}
              onChange={(e) => setFilter({ ...filter, pembayaran: e.target.value })}
            >
              <option value="">Semua</option>
              {STATUS_BAYAR.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={filter.kategori}
              onChange={(e) => setFilter({ ...filter, kategori: e.target.value })}
            >
              <option value="">Semua</option>
              {KATEGORI_PRODUK.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2 d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetFilter}>
              Reset
            </button>
            <button type="button" className="btn btn-dark btn-sm" onClick={handleCetak}>
              <i className="bi bi-printer me-1" /> Cetak
            </button>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <span className="text-secondary small me-1 align-self-center">Periode cepat:</span>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setPeriode(7)}>
            7 hari
          </button>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setPeriode(30)}>
            30 hari
          </button>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setPeriode(90)}>
            90 hari
          </button>
        </div>
      </div>

      {/* HEADER CETAK */}
      <div className="print-only mb-3">
        <h2 className="mb-1">{SITE.nama_toko} — Laporan Penjualan</h2>
        <p className="mb-0 small">
          Dicetak: {formatTanggal(new Date())}
          {filter.dari || filter.sampai
            ? ` · Periode: ${filter.dari || '…'} s/d ${filter.sampai || '…'}`
            : ' · Semua periode'}
          {filter.kategori ? ` · Kategori: ${filter.kategori}` : ''}
          {filter.status ? ` · Status: ${filter.status}` : ''}
        </p>
      </div>

      {/* REKAP TOTAL */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="admin-panel h-100 py-3">
            <div className="text-secondary small">Total transaksi</div>
            <div className="fs-4 fw-semibold">{rekap.totalTransaksi}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-panel h-100 py-3">
            <div className="text-secondary small">Total item terjual</div>
            <div className="fs-4 fw-semibold">{rekap.totalItem}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-panel h-100 py-3">
            <div className="text-secondary small">Nilai semua pesanan</div>
            <div className="fs-5 fw-semibold">{formatRupiah(rekap.totalSemua)}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-panel h-100 py-3">
            <div className="text-secondary small">Pendapatan (Dibayar)</div>
            <div className="fs-5 fw-semibold text-success">{formatRupiah(rekap.totalPendapatan)}</div>
            <div className="small text-secondary">{rekap.belumBayar} belum dibayar</div>
          </div>
        </div>
      </div>

      {/* REKAP PER KATEGORI & STATUS */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="admin-panel h-100">
            <h2 className="admin-section-title mb-3">Rekap per kategori</h2>
            {Object.keys(rekap.byKat).length === 0 ? (
              <p className="text-secondary mb-0">Tidak ada data.</p>
            ) : (
              <table className="table admin-table mb-0">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rekap.byKat).map(([k, v]) => (
                    <tr key={k}>
                      <td>{k}</td>
                      <td>{v.jumlah}</td>
                      <td>{formatRupiah(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="admin-panel h-100">
            <h2 className="admin-section-title mb-3">Rekap per status</h2>
            {Object.keys(rekap.byStatus).length === 0 ? (
              <p className="text-secondary mb-0">Tidak ada data.</p>
            ) : (
              <table className="table admin-table mb-0">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rekap.byStatus).map(([s, n]) => (
                    <tr key={s}>
                      <td>{s}</td>
                      <td>{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* TABEL TRANSAKSI */}
      <div className="admin-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="admin-section-title mb-0">
            Daftar transaksi ({filtered.length})
          </h2>
          <button type="button" className="btn btn-dark btn-sm no-print" onClick={handleCetak}>
            <i className="bi bi-printer me-1" /> Cetak laporan
          </button>
        </div>
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Pembeli</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Bayar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-secondary">
                    Tidak ada transaksi sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="fw-semibold">#{row.id}</td>
                    <td className="text-nowrap">{formatTanggal(row.created_at)}</td>
                    <td>{row.nama_pembeli || '—'}</td>
                    <td>{row.nama_produk || '—'}</td>
                    <td>{row.kategori_produk || row.kategori || '—'}</td>
                    <td>{row.jumlah || row.qty || 1}</td>
                    <td>{formatRupiah(rowTotal(row))}</td>
                    <td>
                      <span className="admin-badge">{row.status || '—'}</span>
                    </td>
                    <td>{row.pembayaran || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="fw-semibold">
                  <td colSpan={5}>Total</td>
                  <td>{rekap.totalItem}</td>
                  <td>{formatRupiah(rekap.totalSemua)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <style>{`
        .print-only { display: none; }
        @media print {
          .no-print, .admin-sidebar, .admin-shell > aside, header, .admin-nav-active,
          .btn, nav, .admin-quick-link { display: none !important; }
          .print-only { display: block !important; }
          .admin-main, .admin-content, .admin-shell { margin: 0 !important; padding: 0 !important; }
          .admin-panel { border: 1px solid #ccc; box-shadow: none; break-inside: avoid; }
          body { background: #fff !important; color: #000 !important; }
          .table { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
