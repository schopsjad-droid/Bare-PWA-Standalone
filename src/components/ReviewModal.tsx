import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
}

export default function ReviewModal({ isOpen, onClose, sellerId, sellerName }: ReviewModalProps) {
  const { user, userProfile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('يرجى اختيار تقييم');
      return;
    }

    if (!user || !userProfile) {
      alert('يجب تسجيل الدخول لإضافة تقييم');
      return;
    }

    if (user.uid === sellerId) {
      alert('لا يمكنك تقييم نفسك');
      return;
    }

    setSubmitting(true);
    try {
      // Add review to seller's reviews subcollection
      await addDoc(collection(db, 'users', sellerId, 'reviews'), {
        reviewerId: user.uid,
        reviewerName: userProfile.username || 'مستخدم',
        rating,
        comment: comment.trim() || null,
        createdAt: serverTimestamp()
      });

      // Update seller's rating summary
      const sellerRef = doc(db, 'users', sellerId);
      await updateDoc(sellerRef, {
        ratingSum: increment(rating),
        ratingCount: increment(1)
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
        setComment('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ أثناء إضافة التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setRating(0);
      setHoveredRating(0);
      setComment('');
      setSubmitted(false);
    }
  };

  const renderStars = () => {
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={submitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '40px',
              padding: '4px',
              transition: 'transform 0.2s',
              transform: (hoveredRating >= star || rating >= star) ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {(hoveredRating >= star || rating >= star) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
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
              تم إضافة تقييمك بنجاح
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
                ⭐ تقييم البائع
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

            {/* Seller Name */}
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}>
                تقييم البائع:
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                👤 {sellerName}
              </div>
            </div>

            {/* Star Rating */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text-primary)',
                textAlign: 'center'
              }}>
                كيف كانت تجربتك مع هذا البائع؟
              </h3>
              {renderStars()}
              {rating > 0 && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  {rating === 1 && 'سيء جداً'}
                  {rating === 2 && 'سيء'}
                  {rating === 3 && 'متوسط'}
                  {rating === 4 && 'جيد'}
                  {rating === 5 && 'ممتاز'}
                </div>
              )}
            </div>

            {/* Comment Text Area */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                تعليق (اختياري)
              </h3>
              <textarea
                placeholder="شارك تجربتك مع هذا البائع..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                maxLength={500}
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
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                textAlign: 'left'
              }}>
                {comment.length}/500
              </div>
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
                disabled={submitting || rating === 0}
                className="btn"
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  opacity: (submitting || rating === 0) ? 0.5 : 1,
                  cursor: (submitting || rating === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
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
