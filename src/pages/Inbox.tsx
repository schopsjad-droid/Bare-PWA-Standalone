import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

interface Chat {
  id: string;
  adId: string;
  adTitle: string;
  adImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount?: number;
}

export default function Inbox() {
  const { user, userProfile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for chats where user is buyer or seller
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Success callback
        if (snapshot.empty) {
          console.log('[Inbox] No chats found');
          setChats([]);
          setLoading(false);
          return;
        }

        const chatsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chat[];
        
        console.log(`[Inbox] Loaded ${chatsData.length} chats`);
        setChats(chatsData);
        setLoading(false);
      },
      (error) => {
        // Error callback
        console.error('[Inbox] Error loading chats:', error);
        
        // Show error message to user (especially important for mobile)
        alert(
          'خطأ في تحميل الرسائل:\n\n' + 
          error.message + 
          '\n\n' +
          'إذا ظهر رابط في الخطأ، افتحه لإنشاء الفهرس المطلوب.'
        );
        
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const getOtherPartyName = (chat: Chat) => {
    return user?.uid === chat.buyerId ? chat.sellerName : chat.buyerName;
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-SY');
  };

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
        <div className="top-accent"></div>
        <Navbar />

        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            الرسائل
          </h1>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="card text-center py-12">
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
              <h3 className="text-xl font-bold mb-2">لا توجد محادثات</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                ابدأ محادثة مع البائعين من خلال الإعلانات
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {chats.map(chat => (
                <Link key={chat.id} href={`/chat/${chat.id}`}>
                  <a style={{
                    display: 'flex',
                    padding: '16px',
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--divider-color)',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                  >
                    {/* Ad Image */}
                    {chat.adImage ? (
                      <img
                        src={chat.adImage}
                        alt={chat.adTitle}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginLeft: '12px',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        marginLeft: '12px',
                        flexShrink: 0
                      }}>
                        📦
                      </div>
                    )}

                    {/* Chat Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <div style={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontSize: '15px'
                        }}>
                          {getOtherPartyName(chat)}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)'
                        }}>
                          {formatTime(chat.lastMessageTime)}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {chat.adTitle}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {chat.lastMessage}
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 999
        }}>
          <Link href="/">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>🏠</span>
              <span>الرئيسية</span>
            </a>
          </Link>
          <Link href="/favorites">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>❤️</span>
              <span>المفضلة</span>
            </a>
          </Link>
          <Link href="/create-ad">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>➕</span>
              <span>إضافة</span>
            </a>
          </Link>
          <Link href="/inbox">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--accent-green)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <span>الرسائل</span>
            </a>
          </Link>
          <Link href="/profile">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>👤</span>
              <span>حسابي</span>
            </a>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
