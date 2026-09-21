// components/RequireAuth.jsx — bungkus route yang butuh login (+ opsional cek role tertentu)
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ role, children }) {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  // Tunggu dulu proses cek sesi dari localStorage selesai (AuthContext.loading)
  if (loading) return null;

  // Belum login sama sekali → lempar ke Login, simpan halaman tujuan supaya bisa balik lagi
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Sudah login tapi role tidak sesuai (misal pembeli coba akses /admin) → lempar ke Beranda
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}