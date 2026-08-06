import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-section">
            <h3 className="footer-brand">Bare</h3>
            <p className="footer-desc">منصة للإعلانات المبوبة. اشترِ وبِع بسهولة وأمان.</p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">روابط سريعة</h4>
            <ul className="footer-links">
              <li><Link href="/"><span>الرئيسية</span></Link></li>
              <li><Link href="/about"><span>من نحن</span></Link></li>
              <li><Link href="/privacy"><span>سياسة الخصوصية</span></Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer-section">
            <h4 className="footer-heading">تواصل معنا</h4>
            <div className="footer-social">
              <a href="#" className="footer-social-icon" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
              <a href="#" className="footer-social-icon" aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a>
              <a href="#" className="footer-social-icon" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg></a>
            </div>
          </div>
        </div>

        <div className="footer-divider" />
        <p className="footer-copyright">&copy; 2025 Bare. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
