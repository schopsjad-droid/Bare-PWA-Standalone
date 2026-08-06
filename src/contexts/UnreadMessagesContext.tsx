import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { NotificationData } from '../components/InAppNotification';

interface UnreadMessagesContextType {
  totalUnread: number;
  unreadByChat: Record<string, number>;
  latestNotification: NotificationData | null;
  dismissNotification: () => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
  totalUnread: 0,
  unreadByChat: {},
  latestNotification: null,
  dismissNotification: () => {}
});

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  const [latestNotification, setLatestNotification] = useState<NotificationData | null>(null);
  const prevUnreadRef = useRef<Record<string, number>>({});
  const chatDataRef = useRef<Record<string, any>>({});
  const isInitialLoad = useRef(true);

  const dismissNotification = useCallback(() => { setLatestNotification(null); }, []);

  useEffect(() => {
    if (!user) {
      setTotalUnread(0);
      setUnreadByChat({});
      prevUnreadRef.current = {};
      chatDataRef.current = {};
      isInitialLoad.current = true;
      return;
    }

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      const byChat: Record<string, number> = {};

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const unreadField = `unreadCount_${user.uid}`;
        const unreadCount = data[unreadField] || 0;
        
        // Store chat data for notification context
        chatDataRef.current[docSnap.id] = data;

        if (unreadCount > 0) {
          total += unreadCount;
          byChat[docSnap.id] = unreadCount;
        }
      });

      // Detect new unread messages (not on initial load)
      if (!isInitialLoad.current) {
        for (const chatId of Object.keys(byChat)) {
          const prevCount = prevUnreadRef.current[chatId] || 0;
          const newCount = byChat[chatId];
          if (newCount > prevCount) {
            // New message received - show toast
            const chatData = chatDataRef.current[chatId];
            if (chatData) {
              const senderName = user.uid === chatData.buyerId ? chatData.sellerName : chatData.buyerName;
              setLatestNotification({
                id: `${chatId}-${Date.now()}`,
                title: `رسالة من ${senderName || 'مستخدم'}`,
                body: chatData.lastMessage || 'رسالة جديدة',
                chatId,
                adTitle: chatData.adTitle
              });
            }
          }
        }
      }

      isInitialLoad.current = false;
      prevUnreadRef.current = byChat;
      setTotalUnread(total);
      setUnreadByChat(byChat);
    }, (error) => {
      console.error('[UnreadMessages] Error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <UnreadMessagesContext.Provider value={{ totalUnread, unreadByChat, latestNotification, dismissNotification }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
