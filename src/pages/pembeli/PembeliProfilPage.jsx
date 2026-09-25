// Profil pembeli — data + foto + ganti password
import { useEffect, useState } from 'react';
import { pembeliApi } from '../../api';
import { usePembeliGuard } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { KELAMIN } from '../../constants';
import SafeImg from '../../components/SafeImg';
import ImageUploadField from '../../components/admin/ImageUploadField';
import LoadingBlock from '../../components/admin/LoadingBlock';
import ProfilePasswordFields from '../../components/profile/ProfilePasswordFields';
import { emptyPasswordFields, buildProfilePayload, toDateInputValue, normalizeKelamin } from '../../utils';

export default function PembeliProfilPage() {
  const { handleError } = usePembeliGuard();
  const { updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let alive = true;
    pembeliApi
      .getMe()
      .then((res) => {
        if (!alive) return;
        const p = res.data || {};
        setForm({
          nama_d: p.nama_d || '',
          nama_b: p.nama_b || '',
          kelamin: normalizeKelamin(p.kelamin) || p.kelamin || KELAMIN[0],
          phone: String(p.phone ?? ''),
          alamat: p.alamat || '',
          email: p.email || '',
          uname: p.uname || '',
          foto: p.foto || p.gambar || '',
          lahir: toDateInputValue(p.lahir) || p.lahir || '',
          ...emptyPasswordFields,
        });
      })
      .catch((err) => {
        if (!alive) return;
        if (!handleError(err)) setError(err.message || 'Gagal memuat profil');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function onPasswordChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function applyFoto(path) {
    setForm((f) => ({ ...f, foto: path || '' }));
    setSuccess('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const base = {
        nama_d: form.nama_d,
        nama_b: form.nama_b,
        kelamin: form.kelamin,
        phone: form.phone,
        alamat: form.alamat,
        email: form.email,
        uname: form.uname,
        foto: form.foto || null,
        passwd_lama: form.passwd_lama,
        passwd_baru: form.passwd_baru,
        passwd_baru_konfirmasi: form.passwd_baru_konfirmasi,
      };
      if (form.lahir) base.lahir = form.lahir;
      const payload = buildProfilePayload(base);
      await pembeliApi.putMe(payload);
      updateUser({
        nama_d: form.nama_d,
        nama_b: form.nama_b,
        foto: form.foto,
      });
      setForm((f) => ({ ...f, ...emptyPasswordFields }));
      setSuccess('Profil berhasil diperbarui');
    } catch (err) {
      if (!handleError(err)) setError(err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <LoadingBlock text="Memuat profil…" />;

  return (
    <div>
      <p className="text-secondary mb-3">Ubah data akun dan foto profil Anda.</p>

      <div className="admin-panel" style={{ maxWidth: "100%" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 d-flex align-items-center gap-3">
            <SafeImg
              src={form.foto}
              alt={form.nama_d}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div className="small text-secondary">
              {uploadingFoto ? 'Menyimpan foto…' : 'Foto profil saat ini'}
            </div>
          </div>

          <ImageUploadField
            label="Ganti foto profil"
            value={form.foto}
            onChange={(v) => applyFoto(v)}
            clearable
            uploadFn={pembeliApi.uploadGambar}
          />

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Nama Depan</label>
              <input name="nama_d" className="form-control" value={form.nama_d} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Nama Belakang</label>
              <input name="nama_b" className="form-control" value={form.nama_b} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Kelamin</label>
              <select name="kelamin" className="form-select" value={form.kelamin} onChange={handleChange}>
                {KELAMIN.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label small fw-semibold">No. HP</label>
              <input name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Alamat</label>
              <textarea name="alamat" className="form-control" rows="2" value={form.alamat} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Email</label>
              <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Username</label>
              <input name="uname" className="form-control" value={form.uname} onChange={handleChange} required />
            </div>
          </div>

          <ProfilePasswordFields values={form} onChange={onPasswordChange} />

          {error && <p className="text-danger small mt-3 mb-0">{error}</p>}
          {success && <p className="text-success small mt-3 mb-0">{success}</p>}

          <button type="submit" disabled={saving} className="btn btn-brand mt-3">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
