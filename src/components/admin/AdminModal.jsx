/**
 * Modal form admin (tambah/ubah) — fixed di tengah, tanpa scroll halaman.
 */
import { useEffect } from 'react';

export default function AdminModal({ show, title, onClose, wide, children }) {
  useEffect(() => {
    if (!show) return undefined;
    document.body.classList.add('admin-modal-open');
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('admin-modal-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`admin-modal ${wide ? 'admin-modal--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button type="button" className="btn-close" aria-label="Tutup" onClick={onClose} />
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}
