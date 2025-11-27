import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { requestNotificationPermission } from '../utils/notifications';

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  profilePic: string | null;
  googleId: string | null;
  isVerified: boolean;
  createdAt: any;
  lastLogin: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
        await updateLastLogin(firebaseUser.uid);
        
        // Request notification permission after login
        // (delayed to not interrupt login flow)
        setTimeout(() => {
          requestNotificationPermission(firebaseUser.uid).catch(err => {
            console.error('Error setting up notifications:', err);
          });
        }, 2000);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Traditional signup with email verification
  const signup = async (email: string, password: string, username: string) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: username
      });

      // Send verification email
      await sendEmailVerification(user, {
        url: window.location.origin + '/login',
        handleCodeInApp: false
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        profilePic: null,
        googleId: null,
        isVerified: false, // Will be true after email verification
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      // Sign out immediately after signup to force verification
      await signOut(auth);
      
      alert('تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Login with email verification check
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('يرجى تفعيل حسابك عبر البريد الإلكتروني أولاً');
      }

      // Update isVerified in Firestore if not already set
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && !userDoc.data().isVerified) {
        await updateDoc(doc(db, 'users', user.uid), {
          isVerified: true
        });
      }

      await updateLastLogin(user.uid);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // New Google user - create profile
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          username: user.displayName || 'مستخدم',
          email: user.email,
          profilePic: user.photoURL,
          googleId: user.uid,
          isVerified: true, // Google users are pre-verified
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Existing user - update last login
        await updateLastLogin(user.uid);
      }

      await fetchUserProfile(user.uid);
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (!user) {
      throw new Error('لا يوجد مستخدم مسجل دخول');
    }

    try {
      await sendEmailVerification(user, {
        url: window.location.origin + '/login',
        handleCodeInApp: false
      });
      alert('تم إرسال رسالة التفعيل إلى بريدك الإلكتروني');
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  // Refresh user profile from Firestore
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resendVerificationEmail,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to translate Firebase error messages to Arabic
function getErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صالح',
    'auth/operation-not-allowed': 'العملية غير مسموح بها',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً',
    'auth/user-disabled': 'تم تعطيل هذا الحساب',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/too-many-requests': 'محاولات كثيرة جداً، يرجى المحاولة لاحقاً',
    'auth/network-request-failed': 'فشل الاتصال بالشبكة',
    'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
    'auth/cancelled-popup-request': 'تم إلغاء طلب تسجيل الدخول',
  };

  return errorMessages[errorCode] || 'حدث خطأ غير متوقع';
}

