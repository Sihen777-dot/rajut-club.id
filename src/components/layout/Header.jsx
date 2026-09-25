import { NavLink, useNavigate } from 'react-router-dom';
import { SITE, PUBLIC_NAV } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navBtn = {
    padding: '.45rem 1.1rem',
    fontSize: '.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 500,
    borderRadius: 0,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid var(--ink, #1a1614)',
    background: 'transparent',
    color: 'var(--ink, #1a1614)',
    transition: 'all .25s',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const navBtnSolid = {
    ...navBtn,
    background: 'var(--ink, #1a1614)',
    color: '#fff',
  };

  return (
    <nav className="navbar navbar-expand-md sticky-top">
      <div className="container">
        <NavLink to="/" className="navbar-brand d-flex align-items-center text-decoration-none gap-2">
          <img
            src="/logo.png"
            alt={SITE.nama_toko}
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink, #1a1614)' }}>
            {SITE.nama_toko}
          </span>
        </NavLink>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto gap-1">
            {PUBLIC_NAV.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'text-brand' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex gap-2 align-items-center mt-3 mt-md-0 flex-wrap">
            <NavLink to="/keranjang" style={navBtn} className="position-relative">
              Keranjang
              {totalItems > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                  style={{ fontSize: '0.65rem', background: 'var(--ink, #1a1614)' }}
                >
                  {totalItems}
                </span>
              )}
            </NavLink>

            {!isLoggedIn && (
              <>
                <NavLink to="/register" style={navBtn}>
                  Daftar
                </NavLink>
                <NavLink to="/login" style={navBtnSolid}>
                  Masuk
                </NavLink>
              </>
            )}

            {isLoggedIn && (
              <>
                <NavLink to={isAdmin ? '/admin' : '/akun'} style={navBtn}>
                  {isAdmin ? 'Admin' : 'Akun'}
                </NavLink>
                <button type="button" onClick={handleLogout} style={navBtn}>
                  Keluar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
