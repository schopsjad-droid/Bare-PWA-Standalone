import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#1a1a1a',
      color: '#e5e5e5',
      padding: '40px 20px 100px 20px', // Extra bottom padding for mobile bottom nav
      marginTop: '60px'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* About Section */}
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#22c55e'
            }}>
              Bare
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#a3a3a3'
            }}>
              منصة للإعلانات المبوبة. اشترِ وبِع بسهولة وأمان.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#e5e5e5'
            }}>
              روابط سريعة
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/">
                  <a style={{
                    color: '#a3a3a3',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
                  >
                    🏠 الرئيسية
                  </a>
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/about">
                  <a style={{
                    color: '#a3a3a3',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
                  >
                    ℹ️ من نحن
                  </a>
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/privacy">
                  <a style={{
                    color: '#a3a3a3',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#22c55e'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
                  >
                    🔒 سياسة الخصوصية
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#e5e5e5'
            }}>
              تواصل معنا
            </h4>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              {/* Facebook */}
              <a
                href="#"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#262626'}
              >
                📘
              </a>
              {/* Twitter */}
              <a
                href="#"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#262626'}
              >
                🐦
              </a>
              {/* Instagram */}
              <a
                href="#"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#262626'}
              >
                📷
              </a>
              {/* WhatsApp */}
              <a
                href="#"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#262626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#262626'}
              >
                💬
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid #404040',
          marginBottom: '24px'
        }} />

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#737373'
        }}>
          <p style={{ margin: 0 }}>
            © 2025 Bare. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
