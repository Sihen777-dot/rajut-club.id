/** Modal read-only detail — fixed di tengah layar */
import { useEffect } from 'react';

export default function AdminDetailModal({ show, title, onClose, children }) {
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
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button type="button" className="btn-close" aria-label="Tutup" onClick={onClose} />
        </div>
        <div className="admin-modal-body">{children}</div>
        <div className="admin-modal-footer">
          <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
