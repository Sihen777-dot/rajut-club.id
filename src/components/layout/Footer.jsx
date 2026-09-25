import { SITE } from '../../constants';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img
                src="/logo.png"
                alt=""
                style={{ height: 32, filter: 'brightness(10)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="footer-brand">{SITE.nama_toko}</span>
            </div>
            <p className="small mb-0" style={{ maxWidth: 320, lineHeight: 1.7, opacity: 0.8 }}>
              {SITE.tentang}
            </p>
          </div>
          <div className="col-md-3">
            <h6 className="mb-3">Kontak</h6>
            <ul className="list-unstyled small mb-0" style={{ lineHeight: 2 }}>
              <li>{SITE.alamat_toko}</li>
              <li>
                <a
                  href={SITE.link_wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  {SITE.tlp_toko}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email_toko}`}
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  {SITE.email_toko}
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="mb-3">Jam operasional</h6>
            <p className="small mb-1 opacity-75">{SITE.hari_buka}</p>
            <p className="fw-semibold text-white mb-1" style={{ fontSize: '1.15rem' }}>
              {SITE.jam_buka} – {SITE.jam_tutup} WIB
            </p>
            <p className="small mb-0 opacity-60">Buka setiap hari, termasuk hari libur.</p>
          </div>
        </div>
        <hr />
        <p className="text-center small mb-0 opacity-50">
          © {new Date().getFullYear()} {SITE.nama_toko}. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
