import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { messaging, db } from '../config/firebase';

// ========================================
// Request Notification Permission & Get FCM Token
// ========================================
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  try {
    // Check if messaging is supported
    if (!messaging) {
      console.warn('[Notifications] Firebase Messaging not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('[Notifications] Permission denied');
      return null;
    }

    console.log('[Notifications] Permission granted');

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY_HERE' // سيتم تحديثه لاحقاً
    });

    if (token) {
      console.log('[Notifications] FCM Token:', token);
      
      // Save token to user profile
      await saveFCMToken(userId, token);
      
      return token;
    } else {
      console.log('[Notifications] No registration token available');
      return null;
    }
  } catch (error) {
    console.error('[Notifications] Error getting permission:', error);
    return null;
  }
}

// ========================================
// Save FCM Token to User Profile
// ========================================
async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if token already exists
    const userDoc = await getDoc(userRef);
    const existingTokens = userDoc.data()?.fcmTokens || [];
    
    if (existingTokens.includes(token)) {
      console.log('[Notifications] Token already saved');
      return;
    }

    // Add token to fcmTokens array
    await updateDoc(userRef, {
      fcmTokens: arrayUnion(token)
    });

    console.log('[Notifications] Token saved to Firestore');
  } catch (error) {
    console.error('[Notifications] Error saving token:', error);
  }
}

// ========================================
// Listen for Foreground Messages
// ========================================
export function setupForegroundMessageListener(onMessageReceived: (payload: any) => void): void {
  if (!messaging) {
    console.warn('[Notifications] Firebase Messaging not supported');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('[Notifications] Foreground message received:', payload);
    
    // Show notification even when app is in foreground
    if (Notification.permission === 'granted') {
      const notificationTitle = payload.notification?.title || 'رسالة جديدة';
      const notificationOptions = {
        body: payload.notification?.body || 'لديك رسالة جديدة',
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        tag: payload.data?.chatId || 'default',
        data: payload.data,
        requireInteraction: true,
        vibrate: [200, 100, 200]
      };

      new Notification(notificationTitle, notificationOptions);
    }

    // Call callback
    onMessageReceived(payload);
  });
}

// ========================================
// Check Notification Permission Status
// ========================================
export function getNotificationPermissionStatus(): NotificationPermission {
  return Notification.permission;
}

// ========================================
// Check if Notifications are Supported
// ========================================
export function areNotificationsSupported(): boolean {
  return 'Notification' in window && messaging !== null;
}
