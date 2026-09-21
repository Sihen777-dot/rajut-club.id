// layouts/AdminLayout.jsx — sidebar panel admin Rajut Club
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SITE } from '../constants';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils';

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'bi-grid-1x2', end: true },
  { to: '/admin/produk', label: 'Produk', icon: 'bi-box-seam' },
  { to: '/admin/pembeli', label: 'Pembeli', icon: 'bi-person' },
  { to: '/admin/pembelian', label: 'Pesanan', icon: 'bi-bag-check' },
  { to: '/admin/artikel', label: 'Artikel', icon: 'bi-journal-text' },
  { to: '/admin/profil', label: 'Profil Saya', icon: 'bi-person-circle' },
];

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/produk': 'Kelola Produk',
  '/admin/pembeli': 'Kelola Pembeli',
  '/admin/pembelian': 'Kelola Pesanan',
  '/admin/artikel': 'Kelola Artikel',
  '/admin/profil': 'Profil Saya',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const title = PAGE_TITLES[location.pathname] || 'Panel Admin';
  const fullName = [user?.nama_d, user?.nama_b].filter(Boolean).join(' ') || 'Admin';

  return (
    <div className="d-flex min-vh-100 admin-shell">
      <aside className="admin-sidebar d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-4 px-2 pt-1">
          {user?.foto && user.foto !== 'default.png' && user.foto !== 'default.jpg' ? (
            <img
              src={mediaUrl(user.foto)}
              alt={fullName}
              className="rounded-circle"
              width={42}
              height={42}
              style={{ objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(201,168,124,0.4)' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
              style={{
                width: 42,
                height: 42,
                flexShrink: 0,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(201,168,124,0.35)',
              }}
            >
              <img
                src="/logo.png"
                alt=""
                style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(1.2)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="fw-semibold text-white text-truncate" style={{ fontSize: '0.95rem' }}>
              {fullName}
            </div>
            <div className="mt-1" style={{ fontSize: 11, color: 'rgba(201,168,124,0.9)', letterSpacing: '0.06em' }}>
              {SITE.nama_toko.toUpperCase()} · ADMIN
            </div>
          </div>
        </div>

        <nav className="nav flex-column gap-1 flex-fill">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link px-3 py-2 text-white-50 d-flex align-items-center gap-2 ${
                  isActive ? 'admin-nav-active text-white fw-semibold' : ''
                }`
              }
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: '1.05rem', width: 22 }} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-3 border-top border-secondary border-opacity-25 mt-auto px-1">
          <NavLink to="/" className="nav-link text-white-50 px-3 py-2 small d-flex align-items-center gap-2">
            <i className="bi bi-house" /> Lihat beranda
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="btn w-100 text-start px-3 py-2 small border-0 d-flex align-items-center gap-2"
            style={{ color: '#e8c9a8' }}
          >
            <i className="bi bi-box-arrow-left" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-fill d-flex flex-column admin-main">
        <header className="d-flex align-items-center">
          <h1 className="mb-0">{title}</h1>
        </header>

        <main className="flex-fill admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
