// context/CartContext.jsx — Keranjang belanja client-side (localStorage)
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'rajut_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((produk, qty = 1) => {
    setItems((prev) => {
      const exist = prev.find((i) => i.id_produk === produk.id_produk);
      if (exist) {
        return prev.map((i) =>
          i.id_produk === produk.id_produk
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          id_produk: produk.id_produk,
          nama_produk: produk.nama_produk,
          harga: produk.harga,
          gambar: produk.gambar,
          kategori: produk.kategori,
          qty: qty,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id_produk) => {
    setItems((prev) => prev.filter((i) => i.id_produk !== id_produk));
  }, []);

  const updateQty = useCallback((id_produk, qty) => {
    const n = Math.max(1, parseInt(qty, 10) || 1);
    setItems((prev) =>
      prev.map((i) => (i.id_produk === id_produk ? { ...i, qty: n } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalHarga = items.reduce((s, i) => s + Number(i.harga) * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalHarga }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
