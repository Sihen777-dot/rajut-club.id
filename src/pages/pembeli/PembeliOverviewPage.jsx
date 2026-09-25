// pages/pembeli/PembeliOverviewPage.jsx — dashboard pembeli (gaya mirip admin)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pembeliApi } from '../../api';
import { usePembeliGuard } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/admin/StatCard';
import LoadingBlock from '../../components/admin/LoadingBlock';

export default function PembeliOverviewPage() {
  const { user } = useAuth();
  const { handleError } = usePembeliGuard();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    pembeliApi
      .getDashboard()
      .then((res) => {
        if (alive) setStats(res.data);
      })
      .catch((err) => {
        if (!alive) return;
        if (!handleError(err)) setError(err.message || 'Gagal memuat data');
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

  const cards = [
    { label: 'Total pesanan', value: stats?.total_pembelian ?? 0, tone: 'dark' },
    { label: 'Menunggu', value: stats?.total_menunggu ?? 0, tone: 'warn' },
    { label: 'Diterima', value: stats?.total_diterima ?? 0, tone: 'gold' },
    { label: 'Selesai', value: stats?.total_selesai ?? 0, tone: 'default' },
  ];

  return (
    <div>
      <p className="text-secondary mb-3">
        Halo, <strong>{user?.nama_d}</strong> — ringkasan aktivitas belanjamu di Rajut Club.
      </p>

      <div className="admin-stats-grid">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="admin-panel mt-4">
        <h2 className="admin-section-title mb-2">Aksi cepat</h2>
        <p className="text-secondary small mb-3">Pesan produk favorit atau cek status pesanan terakhir.</p>
        <div className="admin-quick-links">
          <Link to="/akun/belanja" className="admin-quick-link">
            + Pesan sekarang
          </Link>
          <Link to="/akun/pesanan" className="admin-quick-link">
            Lihat pesanan saya
          </Link>
          <Link to="/akun/profil" className="admin-quick-link">
            Ubah profil
          </Link>
        </div>
      </div>
    </div>
  );
}
