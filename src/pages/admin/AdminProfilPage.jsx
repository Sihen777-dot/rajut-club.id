/**
 * Profil admin — data pribadi + foto + ganti password.
 * Upload foto langsung diikuti PUT /me agar foto tersimpan.
 */
import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useAdminGuard } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import ImageUploadField from '../../components/admin/ImageUploadField';
import ProfilePasswordFields from '../../components/profile/ProfilePasswordFields';
import { KELAMIN } from '../../constants';
import {
  normalizeKelamin,
  toDateInputValue,
  mediaUrl,
  emptyPasswordFields,
  buildProfilePayload,
} from '../../utils';

export default function AdminProfilPage() {
  const { handleError } = useAdminGuard();
  const { updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    adminApi
      .getMe()
      .then((r) => {
        if (!alive) return;
        const raw = r.data || {};
        const p = raw.nama_d ? raw : (raw.user || raw.admin || {});
        setForm({
          nama_d: p.nama_d || '',
          nama_b: p.nama_b || '',
          kelamin: normalizeKelamin(p.kelamin),
          lahir: toDateInputValue(p.lahir),
          alamat: p.alamat || '',
          phone: String(p.phone ?? ''),
          email: p.email || '',
          uname: p.uname || '',
          foto: p.foto || p.gambar || '',
          ...emptyPasswordFields,
        });
      })
      .catch((err) => {
        if (!alive) return;
        handleError(err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function onPasswordChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /** Hanya update preview; simpan ke server lewat tombol Simpan profil */
  async function applyFoto(path) {
    setForm((f) => ({ ...f, foto: path || '' }));
    setSuccess('');
    setError('');
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = buildProfilePayload({
        ...form,
        phone: parseInt(String(form.phone).replace(/\D/g, ''), 10) || form.phone,
        foto: form.foto || null,
      });
      await adminApi.putMe(payload);
      updateUser({
        nama_d: form.nama_d,
        nama_b: form.nama_b,
        foto: form.foto,
      });
      setForm((f) => ({ ...f, ...emptyPasswordFields }));
      setSuccess('Profil berhasil diperbarui.');
    } catch (err) {
      if (!handleError(err)) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;
  if (!form) return null;

  return (
    <div>
      <PageHeader title="Profil admin" subtitle="Ubah data akun Anda" />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={onSubmit} className="admin-panel" style={{ maxWidth: "100%" }}>
        <div className="mb-3 d-flex align-items-center gap-3">
          <img
            src={mediaUrl(form.foto)}
            alt="Foto profil"
            width={80}
            height={80}
            className="rounded-circle"
            style={{ objectFit: 'cover', background: '#eee' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.png';
            }}
          />
          <div className="small text-secondary">
            Foto profil (klik Simpan profil untuk menyimpan)
          </div>
        </div>

        <ImageUploadField
          label="Ganti foto profil"
          value={form.foto}
          onChange={(v) => applyFoto(v)}
          clearable
        />

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nama depan</label>
            <input className="form-control" value={form.nama_d} onChange={set('nama_d')} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Nama belakang</label>
            <input className="form-control" value={form.nama_b} onChange={set('nama_b')} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Jenis kelamin</label>
            <select className="form-select" value={form.kelamin} onChange={set('kelamin')}>
              {KELAMIN.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Tanggal lahir</label>
            <input type="date" className="form-control" value={form.lahir} onChange={set('lahir')} required />
          </div>
          <div className="col-12">
            <label className="form-label">Alamat</label>
            <textarea className="form-control" rows={2} value={form.alamat} onChange={set('alamat')} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Telepon</label>
            <input className="form-control" value={form.phone} onChange={set('phone')} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={set('email')} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Username</label>
            <input className="form-control" value={form.uname} onChange={set('uname')} required />
          </div>
        </div>

        <ProfilePasswordFields values={form} onChange={onPasswordChange} />

        <button type="submit" className="btn btn-dark rounded-0 mt-3" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan profil'}
        </button>
      </form>
    </div>
  );
}
