import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SITE } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [credential, setCredential] = useState('');
  const [passwd, setPasswd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(credential, passwd);
      const tujuan = location.state?.from || (user.role === 'admin' ? '/admin' : '/akun');
      navigate(tujuan, { replace: true });
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-cream min-vh-100 d-flex align-items-center py-5">
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <div className="text-brand fw-bold" style={{ fontSize: '1.1rem', letterSpacing: 1 }}>
            {SITE.nama_toko.toUpperCase()}
          </div>
          <h1 className="h4 fw-bold mt-2 mb-1">Masuk ke Akun Anda</h1>
          <p className="text-muted small mb-0">Gunakan email atau username untuk masuk</p>
        </div>
        <div className="card border-0 shadow-sm p-4 rounded-4">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="nama@email.com"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Kata Sandi</label>
              <input
                type="password"
                className="form-control rounded-3"
                placeholder="Kata sandi Anda"
                value={passwd}
                onChange={(e) => setPasswd(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-brand w-100 py-2" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="text-center small text-muted mt-3 mb-0">
            Belum punya akun?{' '}
            <Link to="/register" className="text-brand fw-semibold text-decoration-none">Daftar</Link>
          </p>
        </div>
        <p className="text-center mt-3">
          <Link to="/" className="text-muted small text-decoration-none">← Kembali ke beranda</Link>
        </p>
      </div>
    </div>
  );
}
