import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
}

export default function ReportModal({ isOpen, onClose, adId, adTitle }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) {
      alert('يرجى اختيار سبب الإبلاغ');
      return;
    }

    if (!user) {
      alert('يجب تسجيل الدخول للإبلاغ');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        adId,
        adTitle,
        reporterId: user.uid,
        reason,
        details: details.trim() || null,
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('');
        setDetails('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setReason('');
      setDetails('');
      setSubmitted(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-in-out'
        }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-primary)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '24px',
          zIndex: 1001,
          maxHeight: '80vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        {submitted ? (
          // Success Message
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              شكراً لك!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              تم إرسال البلاغ بنجاح. سنراجعه في أقرب وقت.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'var(--text-primary)'
              }}>
                الإبلاغ عن الإعلان
              </h2>
              <button
                onClick={handleClose}
                disabled={submitting}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  color: 'var(--text-secondary)',
                  opacity: submitting ? 0.5 : 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Ad Title */}
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}>
                الإعلان:
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-primary)'
              }}>
                {adTitle}
              </div>
            </div>

            {/* Reason Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text-primary)'
              }}>
                سبب الإبلاغ
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { value: 'fraud', label: '🚫 احتيال أو نصب', icon: '🚫' },
                  { value: 'inappropriate', label: 'محتوى غير لائق', icon: '⚠️' },
                  { value: 'spam', label: 'إعلان مكرر أو سبام', icon: '📧' },
                  { value: 'misleading', label: '❌ معلومات مضللة', icon: '❌' },
                  { value: 'other', label: '📝 أخرى', icon: '📝' }
                ].map((option) => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      border: `2px solid ${reason === option.value ? '#dc2626' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: reason === option.value ? 'rgba(220, 38, 38, 0.1)' : 'var(--bg-secondary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={option.value}
                      checked={reason === option.value}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={submitting}
                      style={{
                        marginLeft: '12px',
                        width: '18px',
                        height: '18px',
                        accentColor: '#dc2626'
                      }}
                    />
                    <span style={{
                      fontSize: '15px',
                      color: 'var(--text-primary)',
                      fontWeight: reason === option.value ? '600' : '400'
                    }}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Details Text Area */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                تفاصيل إضافية (اختياري)
              </h3>
              <textarea
                placeholder="أضف أي تفاصيل إضافية تساعدنا في فهم المشكلة..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '12px'
            }}>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="btn"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  opacity: submitting ? 0.5 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="btn"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  opacity: (submitting || !reason) ? 0.5 : 1,
                  cursor: (submitting || !reason) ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
