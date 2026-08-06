import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'wouter';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container py-8" style={{ flex: 1 }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}>
              من نحن
            </h1>
            <div style={{
              width: '60px',
              height: '4px',
              backgroundColor: '#22c55e',
              margin: '0 auto',
              borderRadius: '2px'
            }} />
          </div>

          {/* Content */}
          <div style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: 'var(--text-secondary)'
          }}>
            <section style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                📱 عن Bare
              </h2>
              <p style={{ marginBottom: '16px' }}>
                <strong>Bare</strong> هي منصة متخصصة في الإعلانات المبوبة، تهدف إلى تسهيل عمليات البيع والشراء بين الأفراد والشركات. نوفر بيئة آمنة وموثوقة لنشر الإعلانات وتصفحها بسهولة.
              </p>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                🎯 رؤيتنا
              </h2>
              <p style={{ marginBottom: '16px' }}>
                نسعى لأن نكون المنصة الأولى للإعلانات المبوبة، من خلال توفير تجربة استخدام سلسة وآمنة تربط البائعين والمشترين بكل سهولة.
              </p>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                ✨ ما نقدمه
              </h2>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🏪</span>
                  <span>منصة شاملة لجميع الفئات: سيارات، عقارات، إلكترونيات، وظائف، وأكثر</span>
                </li>
                <li style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🔒</span>
                  <span>نظام تقييمات موثوق للبائعين لضمان الشفافية والأمان</span>
                </li>
                <li style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <span>نظام محادثات مباشر بين المشترين والبائعين</span>
                </li>
                <li style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🔍</span>
                  <span>بحث متقدم وفلاتر ذكية للوصول السريع للإعلانات المناسبة</span>
                </li>
                <li style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>📱</span>
                  <span>تطبيق ويب تقدمي (PWA) يعمل على جميع الأجهزة</span>
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                🤝 التزامنا
              </h2>
              <p style={{ marginBottom: '16px' }}>
                نلتزم بتوفير بيئة آمنة وموثوقة لجميع المستخدمين. نحن نعمل باستمرار على تحسين المنصة وإضافة ميزات جديدة لتلبية احتياجات مجتمعنا.
              </p>
            </section>

            {/* CTA */}
            <div style={{
              textAlign: 'center',
              marginTop: '40px',
              padding: '24px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                هل أنت مستعد للبدء؟
              </h3>
              <Link href="/create-ad">
                <a className="btn btn-primary" style={{
                  textDecoration: 'none',
                  display: 'inline-block'
                }}>
                  ➕ أضف إعلانك الأول
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
