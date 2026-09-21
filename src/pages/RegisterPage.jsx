import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SITE, KELAMIN } from '../constants';
import { api } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama_d: '', nama_b: '', email: '', uname: '', phone: '',
    kelamin: 'Laki-laki', lahir: '', alamat: '-', passwd: '', passwd2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.passwd.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }
    if (form.passwd !== form.passwd2) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }
    setLoading(true);
    try {
      const uname = form.uname || form.email.split('@')[0];
      await api.register({
        nama_d: form.nama_d,
        nama_b: form.nama_b || '-',
        kelamin: form.kelamin,
        lahir: form.lahir || '2000-01-01',
        alamat: form.alamat || '-',
        phone: form.phone || '000',
        email: form.email,
        uname,
        passwd: form.passwd,
        role: 'pembeli',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-cream min-vh-100 d-flex align-items-center py-5">
      <div className="container" style={{ maxWidth: 440 }}>
        <div className="text-center mb-4">
          <div className="text-brand fw-bold" style={{ fontSize: '1.1rem', letterSpacing: 1 }}>
            {SITE.nama_toko.toUpperCase()}
          </div>
          <h1 className="h4 fw-bold mt-2 mb-1">Buat Akun Baru</h1>
          <p className="text-muted small mb-0">Daftar gratis dan mulai memesan</p>
        </div>
        <div className="card border-0 shadow-sm p-4 rounded-4">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nama Depan</label>
              <input name="nama_d" className="form-control rounded-3" placeholder="Nama Anda" value={form.nama_d} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nama Belakang</label>
              <input name="nama_b" className="form-control rounded-3" placeholder="Opsional" value={form.nama_b} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input type="email" name="email" className="form-control rounded-3" placeholder="nama@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Username</label>
              <input name="uname" className="form-control rounded-3" placeholder="Opsional" value={form.uname} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">No. WhatsApp</label>
              <input name="phone" className="form-control rounded-3" placeholder="0812xxxxxxxx" value={form.phone} onChange={handleChange} />
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">Jenis Kelamin</label>
                <select name="kelamin" className="form-select rounded-3" value={form.kelamin} onChange={handleChange}>
                  {KELAMIN.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small fw-semibold">Tanggal Lahir</label>
                <input type="date" name="lahir" className="form-control rounded-3" value={form.lahir} onChange={handleChange} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Kata Sandi</label>
              <input type="password" name="passwd" className="form-control rounded-3" placeholder="Minimal 6 karakter" value={form.passwd} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Konfirmasi Kata Sandi</label>
              <input type="password" name="passwd2" className="form-control rounded-3" placeholder="Ulangi kata sandi" value={form.passwd2} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-brand w-100 py-2" disabled={loading}>
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
          <p className="text-center small text-muted mt-3 mb-0">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-brand fw-semibold text-decoration-none">Masuk</Link>
          </p>
        </div>
        <p className="text-center mt-3">
          <Link to="/" className="text-muted small text-decoration-none">← Kembali ke beranda</Link>
        </p>
      </div>
    </div>
  );
}
