import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface UnreadMessagesContextType {
  totalUnread: number;
  unreadByChat: Record<string, number>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({
  totalUnread: 0,
  unreadByChat: {}
});

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) {
      setTotalUnread(0);
      setUnreadByChat({});
      return;
    }

    // Listen to chats where user is a participant
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      const byChat: Record<string, number> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Check unread count for current user
        const unreadField = `unreadCount_${user.uid}`;
        const unreadCount = data[unreadField] || 0;
        
        if (unreadCount > 0) {
          total += unreadCount;
          byChat[doc.id] = unreadCount;
        }
      });

      setTotalUnread(total);
      setUnreadByChat(byChat);
    }, (error) => {
      console.error('[UnreadMessages] Error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <UnreadMessagesContext.Provider value={{ totalUnread, unreadByChat }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
