import { useState, useEffect, useRef } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { 
  doc,
  increment, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

interface Chat {
  adId: string;
  adTitle: string;
  adImage?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  participants: string[];
}

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

  // Load chat data
  useEffect(() => {
    if (!params?.chatId) return;

    const loadChat = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', params.chatId));
        if (chatDoc.exists()) {
          setChat(chatDoc.data() as Chat);
          
          // Mark messages as read for current user
          if (user) {
            const unreadField = `unreadCount_${user.uid}`;
            await updateDoc(doc(db, 'chats', params.chatId), {
              [unreadField]: 0
            });
          }
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [params?.chatId]);

  // Real-time messages listener
  useEffect(() => {
    if (!params?.chatId) return;

    const messagesRef = collection(db, 'chats', params.chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [params?.chatId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !params?.chatId || !user || !userProfile) return;

    setSending(true);
    try {
      // Add message to subcollection
      await addDoc(collection(db, 'chats', params.chatId, 'messages'), {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: userProfile.username,
        timestamp: serverTimestamp()
      });

      // Update chat's lastMessage and lastMessageTime
      await updateDoc(doc(db, 'chats', params.chatId), {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} requireUsername={true}>
        <div className="flex justify-center items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!chat) {
    return (
      <ProtectedRoute requireAuth={true} requireUsername={true}>
        <div className="container py-8">
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-2">المحادثة غير موجودة</h2>
            <button onClick={() => setLocation('/inbox')} className="btn btn-primary mt-4">
              العودة للرسائل
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const otherPartyName = user?.uid === chat.buyerId ? chat.sellerName : chat.buyerName;

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--divider-color)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Link href="/inbox">
            <a style={{
              color: 'var(--text-primary)',
              fontSize: '24px',
              textDecoration: 'none'
            }}>
              ←
            </a>
          </Link>
          
          <Link href={`/ad/${chat.adId}`}>
            <a style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              flex: 1,
              textDecoration: 'none',
              minWidth: 0
            }}>
              {chat.adImage ? (
                <img
                  src={chat.adImage}
                  alt={chat.adTitle}
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  📦
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '15px'
                }}>
                  {otherPartyName}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {chat.adTitle}
                </div>
              </div>
            </a>
          </Link>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '32px 16px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
              <p>ابدأ المحادثة مع {otherPartyName}</p>
            </div>
          ) : (
            messages.map(message => {
              const isOwnMessage = message.senderId === user?.uid;
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: isOwnMessage ? '#22c55e' : 'var(--bg-card)',
                    color: isOwnMessage ? '#ffffff' : 'var(--text-primary)',
                    wordWrap: 'break-word'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      {message.text}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      opacity: 0.7,
                      textAlign: isOwnMessage ? 'left' : 'right'
                    }}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form 
          onSubmit={handleSendMessage}
          style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--divider-color)',
            padding: '12px 16px',
            display: 'flex',
            gap: '8px'
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              background: newMessage.trim() ? '#22c55e' : 'var(--bg-secondary)',
              color: newMessage.trim() ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontSize: '20px',
              flexShrink: 0
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
