export default function AdminRowActions({ onDetail, onEdit, onDelete, hideDelete }) {
  const btnStyle = {
    width: 32,
    height: 32,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  };

  return (
    <div className="d-flex gap-1 align-items-center">
      {onDetail && (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary rounded-1"
          style={btnStyle}
          onClick={onDetail}
          title="Detail"
          aria-label="Detail"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary rounded-1"
          style={btnStyle}
          onClick={onEdit}
          title="Ubah"
          aria-label="Ubah"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      )}
      {onDelete && !hideDelete && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger rounded-1"
          style={btnStyle}
          onClick={onDelete}
          title="Hapus"
          aria-label="Hapus"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
