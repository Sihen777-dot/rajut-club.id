import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import RequireAuth from './components/RequireAuth';

import AdminLayout from './Layouts/AdminLayout';
import PembeliLayout from './Layouts/PembeliLayout';

import HomePage from './pages/HomePage';
import TokoPage from './pages/TokoPage';
import ProdukDetailPage from './pages/ProductDetailPage';
import ArtikelPage from './pages/ArtikelListPage';
import ArtikelDetailPage from './pages/ArtikelDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';

import PembeliBelanjaPage from './pages/pembeli/PembeliBelanjaPage';
import PembeliOverviewPage from './pages/pembeli/PembeliOverviewPage';
import PembeliPesananPage from './pages/pembeli/PembeliPesananPage';
import PembeliProfilPage from './pages/pembeli/PembeliProfilPage';

import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminProdukPage from './pages/admin/AdminProdukPage';
import AdminPembeliPage from './pages/admin/AdminPembeliPage';
import AdminPembelianPage from './pages/admin/AdminPembelianPage';
import AdminLaporanPage from './pages/admin/AdminLaporanPage';
import AdminArtikelPage from './pages/admin/AdminArtikelPage';
import AdminProfilPage from './pages/admin/AdminProfilPage';

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIK */}
      <Route path="/" element={<HomePage />} />
      <Route path="/toko" element={<TokoPage />} />
      <Route path="/toko/:id" element={<ProdukDetailPage />} />
      <Route path="/artikel" element={<ArtikelPage />} />
      <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
      <Route path="/keranjang" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* AREA PEMBELI — Dashboard, Membeli, Pesanan Saya, Profil Saya */}
      <Route
        path="/akun"
        element={
          <RequireAuth role="pembeli">
            <PembeliLayout />
          </RequireAuth>
        }
      >
        <Route index element={<PembeliOverviewPage />} />
        <Route path="belanja" element={<PembeliBelanjaPage />} />
        <Route path="pesanan" element={<PembeliPesananPage />} />
        <Route path="profil" element={<PembeliProfilPage />} />
      </Route>

      {/* AREA ADMIN */}
      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="produk" element={<AdminProdukPage />} />
        <Route path="pembeli" element={<AdminPembeliPage />} />
        <Route path="pembelian" element={<AdminPembelianPage />} />
        <Route path="laporan" element={<AdminLaporanPage />} />
        <Route path="artikel" element={<AdminArtikelPage />} />
        <Route path="profil" element={<AdminProfilPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
