// layouts/PembeliLayout.jsx — area akun pembeli
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SITE } from '../constants';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils';

const PEMBELI_NAV = [
  { to: '/akun', label: 'Dashboard', end: true },
  { to: '/akun/belanja', label: 'Membeli' },
  { to: '/akun/pesanan', label: 'Pesanan Saya' },
  { to: '/akun/profil', label: 'Profil Saya' },
];

const PAGE_TITLES = {
  '/akun': 'Dashboard',
  '/akun/belanja': 'Membeli',
  '/akun/pesanan': 'Pesanan Saya',
  '/akun/profil': 'Profil Saya',
};

export default function PembeliLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const title = PAGE_TITLES[location.pathname] || 'Akun Saya';
  const fullName = [user?.nama_d, user?.nama_b].filter(Boolean).join(' ') || 'Pembeli';

  return (
    <div className="d-flex min-vh-100 admin-shell">
      <aside className="admin-sidebar d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
          {user?.foto && user.foto !== 'default.png' && user.foto !== 'default.jpg' ? (
            <img
              src={mediaUrl(user.foto)}
              alt={fullName}
              className="rounded-circle border border-secondary"
              width={40}
              height={40}
              style={{ objectFit: 'cover', flexShrink: 0 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div
              className="bg-white rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
              style={{ width: 40, height: 40, flexShrink: 0 }}
            >
              <img
                src="/logo.gif"
                alt=""
                style={{ width: 28, height: 28, objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="fw-bold fs-6 lh-1 text-white text-truncate">{fullName}</div>
            <div className="text-white-50 small mt-1" style={{ fontSize: 11 }}>
              {SITE.nama_toko} · Pembeli
            </div>
          </div>
        </div>

        <nav className="nav flex-column gap-1 flex-fill">
          {PEMBELI_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link rounded px-3 py-2 text-white-50 d-flex align-items-center gap-2 ${
                  isActive ? 'admin-nav-active text-white fw-semibold' : ''
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-3 border-top border-secondary border-opacity-25 mt-auto">
          <NavLink to="/" className="nav-link text-white-50 px-3 py-1 small mb-1">
            Lihat beranda
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="btn text-warning text-decoration-none px-3 py-1 small text-start border-0"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex-fill d-flex flex-column admin-main">
        <header className="px-4 py-3 bg-white d-flex align-items-center border-bottom">
          <h1 className="h5 mb-0 fw-semibold text-dark">{title}</h1>
        </header>

        <main className="p-4 flex-fill admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
