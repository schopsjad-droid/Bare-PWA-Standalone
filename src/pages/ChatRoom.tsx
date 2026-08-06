import { useState, useEffect, useRef } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

interface Message { id: string; text: string; senderId: string; senderName: string; timestamp: any; }
interface Chat { adId: string; adTitle: string; adImage?: string; buyerId: string; buyerName: string; sellerId: string; sellerName: string; participants: string[]; }

export default function ChatRoom() {
  const { user, userProfile } = useAuth();
  const [, params] = useRoute('/chat/:chatId');
  const [, setLocation] = useLocation();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params?.chatId) return;
    const loadChat = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', params.chatId));
        if (chatDoc.exists()) {
          setChat(chatDoc.data() as Chat);
          if (user) { await updateDoc(doc(db, 'chats', params.chatId), { [`unreadCount_${user.uid}`]: 0 }); }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadChat();
  }, [params?.chatId]);

  useEffect(() => {
    if (!params?.chatId) return;
    const q = query(collection(db, 'chats', params.chatId, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => { setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[]); });
    return () => unsub();
  }, [params?.chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !params?.chatId || !user || !userProfile) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', params.chatId, 'messages'), { text: newMessage.trim(), senderId: user.uid, senderName: userProfile.username, timestamp: serverTimestamp() });
      // Determine recipient and increment their unread count
      const recipientId = chat.participants.find(p => p !== user.uid);
      const updateData: any = { lastMessage: newMessage.trim(), lastMessageTime: serverTimestamp() };
      if (recipientId) { updateData[`unreadCount_${recipientId}`] = increment(1); }
      await updateDoc(doc(db, 'chats', params.chatId), updateData);
      setNewMessage('');
    } catch (e) { console.error(e); alert('فشل إرسال الرسالة'); }
    finally { setSending(false); }
  };

  const formatTime = (ts: any) => { if (!ts) return ''; return ts.toDate().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }); };

  if (loading) return <ProtectedRoute requireAuth={true} requireUsername={true}><div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div></ProtectedRoute>;

  if (!chat) return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div className="page-wrap"><div className="empty-state"><h3>المحادثة غير موجودة</h3><button onClick={() => setLocation('/inbox')} className="btn btn-primary">العودة للرسائل</button></div></div>
    </ProtectedRoute>
  );

  const otherPartyName = user?.uid === chat.buyerId ? chat.sellerName : chat.buyerName;

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div className="chat-room">
        {/* Header */}
        <div className="chat-room-header">
          <Link href="/inbox"><span className="page-header-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </span></Link>
          <Link href={`/ad/${chat.adId}`}>
            <span className="chat-room-info">
              <div className="chat-room-avatar">
                {chat.adImage ? <img src={chat.adImage} alt="" /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                )}
              </div>
              <div className="chat-room-meta">
                <div className="chat-room-name">{otherPartyName}</div>
                <div className="chat-room-ad">{chat.adTitle}</div>
              </div>
            </span>
          </Link>
        </div>

        {/* Messages */}
        <div className="chat-room-messages">
          {messages.length === 0 ? (
            <div className="chat-room-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p>ابدأ المحادثة مع {otherPartyName}</p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.senderId === user?.uid;
              return (
                <div key={msg.id} className={`chat-bubble-wrap ${isOwn ? 'own' : ''}`}>
                  <div className={`chat-bubble ${isOwn ? 'own' : ''}`}>
                    <div className="chat-bubble-text">{msg.text}</div>
                    <div className="chat-bubble-time">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="chat-room-input">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="اكتب رسالة..." disabled={sending} className="chat-room-field" />
          <button type="submit" disabled={!newMessage.trim() || sending} className={`chat-room-send${newMessage.trim() ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
