import { Link } from 'wouter';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">من نحن</h1>
        <div className="page-header-spacer" />
      </header>

      <div className="page-content">
        <div className="content-page">
          <div className="content-page-header">
            <h1 className="content-page-title">من نحن</h1>
            <div className="content-page-accent" />
          </div>

          <section className="content-section">
            <h2 className="content-section-title">عن Bare</h2>
            <p className="content-text"><strong>Bare</strong> هي منصة متخصصة في الإعلانات المبوبة، تهدف إلى تسهيل عمليات البيع والشراء بين الأفراد والشركات. نوفر بيئة آمنة وموثوقة لنشر الإعلانات وتصفحها بسهولة.</p>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">رؤيتنا</h2>
            <p className="content-text">نسعى لأن نكون المنصة الأولى للإعلانات المبوبة، من خلال توفير تجربة استخدام سلسة وآمنة تربط البائعين والمشترين بكل سهولة.</p>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">ما نقدمه</h2>
            <ul className="content-list">
              <li>نشر إعلانات مجانية بسرعة وسهولة</li>
              <li>تصفح إعلانات حسب الفئة والموقع</li>
              <li>نظام مراسلة مباشر بين البائع والمشتري</li>
              <li>نظام تقييم للبائعين لبناء الثقة</li>
              <li>حماية الخصوصية وأمان البيانات</li>
            </ul>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">تواصل معنا</h2>
            <p className="content-text">لأي استفسار أو اقتراح، يمكنك التواصل معنا عبر البريد الإلكتروني:</p>
            <p className="content-text"><strong>support@bare-app.com</strong></p>
          </section>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
