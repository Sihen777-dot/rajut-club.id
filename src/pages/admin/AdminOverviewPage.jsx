/**
 * Dashboard admin — tampilan elegan.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { useAdminGuard } from '../../hooks';
import StatCard from '../../components/admin/StatCard';
import LoadingBlock from '../../components/admin/LoadingBlock';
import { formatRupiah, formatTanggal } from '../../utils';
import { useAuth } from '../../context/AuthContext';

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) {
      if (Array.isArray(v[k])) return v[k];
    }
  }
  return [];
}

function num(...candidates) {
  for (const v of candidates) {
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function flattenStats(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const base =
    payload.stats && typeof payload.stats === 'object' && !Array.isArray(payload.stats)
      ? { ...payload.stats }
      : { ...payload };

  const transaksi =
    payload.transaksi_terbaru ||
    payload.recent ||
    base.transaksi_terbaru ||
    base.recent ||
    [];

  return {
    ...base,
    transaksi_terbaru: Array.isArray(transaksi) ? transaksi : [],
    total_pendapatan: num(base.total_pendapatan, payload.total_pendapatan, payload.pendapatan, base.pendapatan),
  };
}

function computeFromLists({ produk, pembeli, artikel, pembelian }) {
  const listP = asArray(produk);
  const listB = asArray(pembeli);
  const listA = asArray(artikel);
  const listOrder = asArray(pembelian);

  const aktif = listOrder.filter((o) => {
    const s = String(o.status || '').toLowerCase();
    return s === 'menunggu' || s === 'diterima';
  }).length;

  const belum = listOrder.filter((o) => {
    const p = String(o.pembayaran || o.status_bayar || '').toLowerCase();
    return p.includes('belum') || p === 'belum_dibayar';
  }).length;

  const dibayar = listOrder.filter((o) => {
    const p = String(o.pembayaran || o.status_bayar || '').toLowerCase();
    return p === 'dibayar' || p.includes('lunas') || p === 'paid';
  });

  const totalPendapatan = dibayar.reduce((sum, o) => {
    const harga = num(o.total, o.harga, o.harga_produk, o.jumlah_bayar);
    return sum + harga;
  }, 0);

  const sorted = [...listOrder].sort((a, b) => {
    const ta = new Date(a.created_at || a.tanggal || 0).getTime();
    const tb = new Date(b.created_at || b.tanggal || 0).getTime();
    return tb - ta;
  });

  return {
    jumlah_pembeli: listB.length,
    jumlah_transaksi: listOrder.length,
    jumlah_produk: listP.length,
    produk_terjual: listOrder.length,
    jumlah_artikel: listA.length,
    pesanan_aktif: aktif,
    belum_dibayar: belum,
    total_pendapatan: totalPendapatan,
    transaksi_terbaru: sorted.slice(0, 8).map((row) => ({
      id: row.id || row.id_pembelian,
      nama_pembeli: row.nama_pembeli || row.pembeli || row.nama || '—',
      nama_produk: row.nama_produk || row.produk || '—',
      status: row.status || '—',
      pembayaran: row.pembayaran || row.status_bayar || '—',
      created_at: row.created_at || row.tanggal,
    })),
    _source: 'aggregate',
  };
}

function hasAnyStat(data) {
  if (!data) return false;
  return (
    num(data.jumlah_pembeli, data.jumlah_produk, data.jumlah_artikel, data.jumlah_transaksi) > 0 ||
    (Array.isArray(data.transaksi_terbaru) && data.transaksi_terbaru.length > 0)
  );
}

async function loadDashboard() {
  try {
    const r = await adminApi.getStats();
    const source =
      r.data && typeof r.data === 'object' && !Array.isArray(r.data)
        ? r.data
        : r.raw && typeof r.raw === 'object'
          ? r.raw
          : null;
    const flat = flattenStats(source);
    if (flat && hasAnyStat(flat)) return flat;
  } catch {
    /* fallback */
  }

  const [produk, pembeli, artikel, pembelian] = await Promise.all([
    adminApi.getProduk().then((r) => r.data).catch(() => []),
    adminApi.getPembeli().then((r) => r.data).catch(() => []),
    adminApi.getArtikel().then((r) => r.data).catch(() => []),
    adminApi.getPembelian().then((r) => r.data).catch(() => []),
  ]);

  return computeFromLists({ produk, pembeli, artikel, pembelian });
}

function statusBadgeClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'selesai') return 'admin-badge' /* keep */;
  if (s === 'menunggu') return 'admin-badge';
  return 'admin-badge';
}

export default function AdminOverviewPage() {
  const { handleError } = useAdminGuard();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadDashboard()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((err) => {
        if (!alive) return;
        if (!handleError(err)) setError(err.message || 'Gagal memuat dashboard');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  if (loading) return <LoadingBlock />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return null;

  const nama = [user?.nama_d, user?.nama_b].filter(Boolean).join(' ') || 'Admin';

  const stats = [
    {
      label: 'Pembeli',
      value: num(data.jumlah_pembeli, data.total_pembeli, data.pembeli),
      tone: 'gold',
      icon: 'bi-people',
    },
    {
      label: 'Transaksi',
      value: num(data.jumlah_transaksi, data.total_transaksi, data.transaksi),
      tone: 'dark',
      icon: 'bi-receipt',
    },
    {
      label: 'Produk',
      value: num(data.jumlah_produk, data.total_produk, data.produk),
      tone: 'default',
      icon: 'bi-box-seam',
    },
    {
      label: 'Terjual',
      value: num(data.produk_terjual, data.terjual),
      hint: 'Jumlah pesanan',
      tone: 'gold',
      icon: 'bi-bag-check',
    },
    {
      label: 'Artikel',
      value: num(data.jumlah_artikel, data.total_artikel, data.artikel),
      tone: 'default',
      icon: 'bi-journal-text',
    },
    {
      label: 'Pesanan aktif',
      value: num(data.pesanan_aktif, data.aktif),
      tone: 'warn',
      icon: 'bi-hourglass-split',
    },
    {
      label: 'Belum dibayar',
      value: num(data.belum_dibayar),
      tone: 'warn',
      icon: 'bi-wallet2',
    },
  ];

  const transaksi = Array.isArray(data.transaksi_terbaru) ? data.transaksi_terbaru : [];

  // Data untuk grafik sederhana (tanpa library)
  const chartStatus = [
    { label: 'Pesanan aktif', value: num(data.pesanan_aktif, data.aktif), color: '#c9a87c' },
    { label: 'Belum dibayar', value: num(data.belum_dibayar), color: '#d4a017' },
    { label: 'Transaksi', value: num(data.jumlah_transaksi, data.total_transaksi), color: '#3d2b1f' },
    { label: 'Produk', value: num(data.jumlah_produk, data.total_produk), color: '#6b5344' },
  ];
  const maxChart = Math.max(...chartStatus.map((c) => c.value), 1);

  return (
    <div>
      <div className="admin-welcome">
        <h2>Selamat datang, {nama}</h2>
        <p>Ringkasan toko Rajut Club — pantau produk, pesanan, dan pendapatan dari satu tempat.</p>
      </div>

      <div className="admin-stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-4">
          <div className="admin-panel h-100">
            <h2 className="admin-section-title mb-2">Pendapatan</h2>
            <p className="text-secondary small mb-3">Dari pesanan berstatus Dibayar</p>
            <div className="admin-revenue">{formatRupiah(num(data.total_pendapatan))}</div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="admin-panel h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="admin-section-title mb-0">Aksi cepat</h2>
            </div>
            <div className="admin-quick-links">
              <Link to="/admin/produk" className="admin-quick-link">
                <i className="bi bi-plus-lg" /> Tambah produk
              </Link>
              <Link to="/admin/laporan" className="admin-quick-link">
                <i className="bi bi-bar-chart-line" /> Laporan penjualan
              </Link>
              <Link to="/admin/pembelian" className="admin-quick-link">
                <i className="bi bi-bag" /> Lihat pesanan
              </Link>
              <Link to="/admin/pembeli" className="admin-quick-link">
                <i className="bi bi-people" /> Kelola pembeli
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* GRAFIK / STATISTIK */}
      <div className="admin-panel mt-4">
        <h2 className="admin-section-title mb-3">Grafik statistik toko</h2>
        <div className="row g-3 align-items-end">
          {chartStatus.map((c) => (
            <div key={c.label} className="col-6 col-md-3">
              <div className="text-center">
                <div
                  style={{
                    height: 140,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    title={`${c.label}: ${c.value}`}
                    style={{
                      width: '48%',
                      minHeight: 8,
                      height: `${Math.max(8, (c.value / maxChart) * 100)}%`,
                      background: c.color,
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                </div>
                <div className="fw-semibold mt-2" style={{ fontSize: '1.1rem' }}>
                  {c.value}
                </div>
                <div className="text-secondary small">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="admin-section-title mb-0">Transaksi terbaru</h2>
          <div className="d-flex gap-2">
            <Link to="/admin/laporan" className="admin-quick-link" style={{ padding: '0.4rem 0.9rem' }}>
              Laporan →
            </Link>
            <Link to="/admin/pembelian" className="admin-quick-link" style={{ padding: '0.4rem 0.9rem' }}>
              Semua pesanan →
            </Link>
          </div>
        </div>
        {transaksi.length === 0 ? (
          <p className="text-secondary mb-0">Belum ada pesanan.</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pembeli</th>
                  <th>Produk</th>
                  <th>Status</th>
                  <th>Bayar</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map((row) => (
                  <tr key={row.id || row.id_pembelian}>
                    <td className="fw-semibold">#{row.id || row.id_pembelian}</td>
                    <td>{row.nama_pembeli || '—'}</td>
                    <td>{row.nama_produk || '—'}</td>
                    <td>
                      <span className={statusBadgeClass(row.status)}>{row.status || '—'}</span>
                    </td>
                    <td>{row.pembayaran || '—'}</td>
                    <td className="text-nowrap text-secondary">{formatTanggal(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
