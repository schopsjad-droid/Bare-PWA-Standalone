import { useState } from 'react';
import { useLocation } from 'wouter';
import { doc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function CompleteProfile() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [, setLocation] = useLocation();

  // Check if username is already set
  if (userProfile?.username && userProfile.username !== 'مستخدم') {
    setLocation('/');
  }

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snapshot = await getDocs(q);
      return snapshot.empty; // true if available
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }

    if (username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    if (username.length > 20) {
      setError('اسم المستخدم يجب أن يكون 20 حرف كحد أقصى');
      return;
    }

    // Check for valid characters (letters, numbers, underscore, dash)
    const usernameRegex = /^[a-zA-Z0-9_\u0600-\u06FF-]+$/;
    if (!usernameRegex.test(username)) {
      setError('اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط');
      return;
    }

    setLoading(true);

    try {
      // Check if username is already taken
      const isAvailable = await checkUsernameAvailability(username);
      
      if (!isAvailable) {
        setError('اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر');
        setLoading(false);
        return;
      }

      // Update user document
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          username: username.trim()
        });

        // Refresh user profile in context
        await refreshUserProfile();

        // Redirect to home
        setLocation('/');
      }
    } catch (err: any) {
      console.error('Error updating username:', err);
      setError('حدث خطأ أثناء حفظ اسم المستخدم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top Green Accent Line */}
      <div className="top-accent"></div>

      <div className="flex items-center justify-center" style={{ minHeight: '100vh', paddingTop: '60px' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👤</div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              إكمال الملف الشخصي
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              مرحباً! يرجى اختيار اسم مستخدم للمتابعة
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          <div style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--text-primary)' }}>لماذا نحتاج اسم مستخدم؟</strong><br/>
              سيظهر اسم المستخدم على جميع إعلاناتك بدلاً من بريدك الإلكتروني لحماية خصوصيتك.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="label">اسم المستخدم</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="مثال: Tiger2025"
                minLength={3}
                maxLength={20}
                autoFocus
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                • من 3 إلى 20 حرف<br/>
                • حروف وأرقام فقط (يمكن استخدام _ و -)
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px' }}
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ والمتابعة'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: 'rgba(34, 197, 94, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              💡 <strong>نصيحة:</strong> اختر اسماً يسهل تذكره وسيظهر للجميع على إعلاناتك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

