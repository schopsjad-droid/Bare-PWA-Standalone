import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  existingRating?: number | null;
  existingReviewId?: string | null;
  onRatingUpdated?: () => void;
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  sellerId, 
  sellerName,
  existingRating = null,
  existingReviewId = null,
  onRatingUpdated
}: ReviewModalProps) {
  const { user, userProfile } = useAuth();
  const [rating, setRating] = useState(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isEditing = existingRating !== null && existingReviewId !== null;

  useEffect(() => {
    if (isOpen && existingRating) {
      setRating(existingRating);
    }
  }, [isOpen, existingRating]);

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
      const sellerRef = doc(db, 'users', sellerId);

      if (isEditing && existingReviewId) {
        // Update existing review
        const reviewRef = doc(db, 'users', sellerId, 'reviews', existingReviewId);
        const ratingDiff = rating - (existingRating || 0);
        
        await updateDoc(reviewRef, {
          rating,
          updatedAt: serverTimestamp()
        });

        // Update seller's rating summary (only the difference)
        if (ratingDiff !== 0) {
          await updateDoc(sellerRef, {
            ratingSum: increment(ratingDiff)
          });
        }
      } else {
        // Add new review
        await addDoc(collection(db, 'users', sellerId, 'reviews'), {
          reviewerId: user.uid,
          reviewerName: userProfile.username || 'مستخدم',
          rating,
          createdAt: serverTimestamp()
        });

        // Update seller's rating summary
        await updateDoc(sellerRef, {
          ratingSum: increment(rating),
          ratingCount: increment(1)
        });
      }

      setSubmitted(true);
      if (onRatingUpdated) {
        onRatingUpdated();
      }
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
      }, 1500);
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
      setRating(existingRating || 0);
      setHoveredRating(0);
      setSubmitted(false);
    }
  };

  const renderStars = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '12px'
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
              fontSize: '36px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              padding: '4px',
              transition: 'transform 0.2s',
              transform: (hoveredRating >= star || rating >= star) ? 'scale(1.1)' : 'scale(1)',
              filter: submitting ? 'grayscale(50%)' : 'none'
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
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-primary)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '24px',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
      >
        {submitted ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              {isEditing ? 'تم تحديث التقييم!' : 'شكراً لتقييمك!'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              تقييمك يساعد الآخرين في اتخاذ قرارات أفضل
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {isEditing ? 'تعديل التقييم' : 'تقييم البائع'}
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
                {isEditing ? 'تعديل تقييمك لـ:' : 'تقييم البائع:'}
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
                {submitting ? 'جاري الإرسال...' : (isEditing ? 'تحديث التقييم' : 'إرسال التقييم')}
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
