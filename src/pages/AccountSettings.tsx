import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { useLocation } from 'wouter';

export default function AccountSettings() {
  const { user, userProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }

    if (userProfile?.username) {
      setUsername(userProfile.username);
    }
  }, [user, userProfile]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !username.trim()) {
      setMessage('الرجاء إدخال اسم مستخدم صالح');
      return;
    }

    if (username.trim() === 'مستخدم') {
      setMessage('لا يمكن استخدام "مستخدم" كاسم مستخدم');
      return;
    }

    if (username.trim().length < 3) {
      setMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: username.trim()
      });

      setMessage('✅ تم حفظ التغييرات بنجاح');
      
      // Reload page after 1 second to update context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating username:', error);
      setMessage('❌ فشل حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLocation('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('فشل تسجيل الخروج');
    }
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      
      <div className="container py-8">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-6">إعدادات الحساب</h1>

          {/* Email Display */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              البريد الإلكتروني
            </label>
            <div style={{
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              color: 'var(--text-muted)'
            }}>
              {user.email}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              لا يمكن تعديل البريد الإلكتروني
            </p>
          </div>

          {/* Username Form */}
          <form onSubmit={handleSaveUsername}>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                اسم المستخدم *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اختر اسم مستخدم"
                className="input"
                required
                minLength={3}
                disabled={saving}
              />
              <p className="text-sm text-gray-500 mt-1">
                سيظهر اسمك في الإعلانات والمحادثات
              </p>
            </div>

            {message && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '8px',
                background: message.includes('✅') ? '#d4edda' : '#f8d7da',
                color: message.includes('✅') ? '#155724' : '#721c24',
                border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%', marginBottom: '12px' }}
            >
              {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--divider-color)',
            margin: '24px 0'
          }} />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              width: '100%',
              background: '#ef4444',
              color: 'white',
              border: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
          >
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
