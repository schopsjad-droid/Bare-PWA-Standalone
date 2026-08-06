import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadMessages } from '../contexts/UnreadMessagesContext';
import { Link } from 'wouter';
import MobileBottomNav from '../components/MobileBottomNav';
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
}

export default function Inbox() {
  const { user } = useAuth();
  const { unreadByChat } = useUnreadMessages();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid), orderBy('lastMessageTime', 'desc'));
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        if (snapshot.empty) { setChats([]); setLoading(false); return; }
        const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chat[];
        setChats(chatsData);
        setLoading(false);
      },
      (error) => { console.error('[Inbox] Error:', error); setLoading(false); }
    );
    return () => unsubscribe();
  }, [user]);

  const getOtherPartyName = (chat: Chat) => user?.uid === chat.buyerId ? chat.sellerName : chat.buyerName;

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} د`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `منذ ${diffHours} س`;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) return `منذ ${diffDays} ي`;
    return date.toLocaleDateString('ar-SY');
  };

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div className="page-wrap">
        <header className="page-header">
          <Link href="/"><span className="page-header-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </span></Link>
          <h1 className="page-header-title">الرسائل</h1>
          <div className="page-header-spacer" />
        </header>

        <div className="page-content" style={{ padding: 0 }}>
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>لا توجد محادثات</h3>
              <p>ابدأ محادثة مع البائعين من خلال الإعلانات</p>
              <Link href="/"><span className="btn btn-primary">تصفح الإعلانات</span></Link>
            </div>
          ) : (
            <div className="chat-list">
              {chats.map(chat => {
                const unread = unreadByChat[chat.id] || 0;
                return (
                  <Link key={chat.id} href={`/chat/${chat.id}`}>
                    <span className="chat-item">
                      <div className="chat-item-avatar">
                        {chat.adImage ? (
                          <img src={chat.adImage} alt="" />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        )}
                      </div>
                      <div className="chat-item-body">
                        <div className="chat-item-top">
                          <span className={`chat-item-name${unread > 0 ? ' unread' : ''}`}>
                            {getOtherPartyName(chat)}
                            {unread > 0 && <span className="chat-item-badge">{unread}</span>}
                          </span>
                          <span className="chat-item-time">{formatTime(chat.lastMessageTime)}</span>
                        </div>
                        <div className="chat-item-ad">{chat.adTitle}</div>
                        <div className="chat-item-msg">{chat.lastMessage || 'بدء المحادثة...'}</div>
                      </div>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
