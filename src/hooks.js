/**
 * hooks.js — guard sesi + load list + data beranda.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { api } from './api';
import { SITE } from './constants';
import { kategoriDariProduk } from './utils';

export function useAdminGuard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleError = useCallback(
    (err) => {
      if (err?.status === 401 || err?.status === 403) {
        logout();
        navigate('/login', { replace: true, state: { from: '/admin' } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );
  return { handleError };
}

export function usePembeliGuard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleError = useCallback(
    (err) => {
      if (err?.status === 401 || err?.status === 403) {
        logout();
        navigate('/login', { replace: true, state: { from: '/akun' } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );
  return { handleError };
}

export function useAdminList(apiFn) {
  const { handleError } = useAdminGuard();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    return apiFn()
      .then((r) => setRows(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (!handleError(err)) setError(err.message || 'Gagal memuat data');
      })
      .finally(() => setLoading(false));
  }, [apiFn, handleError]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { rows, loading, error, reload };
}

export function usePembeliList(apiFn) {
  const { handleError } = usePembeliGuard();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    return apiFn()
      .then((r) => setRows(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (!handleError(err)) setError(err.message || 'Gagal memuat data');
      })
      .finally(() => setLoading(false));
  }, [apiFn, handleError]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { rows, loading, error, reload };
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  // kadang API mengembalikan { produk: [...] } atau { data: [...] }
  for (const key of ['produk', 'artikel', 'data', 'rows', 'items']) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

export function useBerandaData() {
  const [produk, setProduk] = useState([]);
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const info = SITE;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pRes, aRes] = await Promise.all([api.getProduk(), api.getArtikel()]);
        if (cancelled) return;
        setProduk(asArray(pRes?.data ?? pRes?.raw ?? pRes));
        setArtikel(asArray(aRes?.data ?? aRes?.raw ?? aRes));
      } catch {
        if (!cancelled) {
          setProduk([]);
          setArtikel([]);
          setError('Data toko tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const safeProduk = Array.isArray(produk) ? produk : [];
  const safeArtikel = Array.isArray(artikel) ? artikel : [];

  const kategoriList = useMemo(() => kategoriDariProduk(safeProduk), [safeProduk]);
  const produkTerbaru = useMemo(
    () =>
      [...safeProduk]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 4),
    [safeProduk]
  );
  const artikelTampil = useMemo(() => safeArtikel.slice(0, 3), [safeArtikel]);

  return {
    produk: safeProduk,
    artikel: safeArtikel,
    artikelTampil,
    info,
    loading,
    error,
    kategoriList,
    produkTerbaru,
  };
}
