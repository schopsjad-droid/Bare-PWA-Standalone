import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface ReviewModalProps { isOpen: boolean; onClose: () => void; sellerId: string; sellerName: string; existingRating?: number | null; existingReviewId?: string | null; onRatingUpdated?: () => void; }

export default function ReviewModal({ isOpen, onClose, sellerId, sellerName, existingRating = null, existingReviewId = null, onRatingUpdated }: ReviewModalProps) {
  const { user, userProfile } = useAuth();
  const [rating, setRating] = useState(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isEditing = existingRating !== null && existingReviewId !== null;

  useEffect(() => { if (isOpen && existingRating) setRating(existingRating); }, [isOpen, existingRating]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) { alert('يرجى اختيار تقييم'); return; }
    if (!user || !userProfile) { alert('يجب تسجيل الدخول'); return; }
    if (user.uid === sellerId) { alert('لا يمكنك تقييم نفسك'); return; }
    setSubmitting(true);
    try {
      const sellerRef = doc(db, 'users', sellerId);
      if (isEditing && existingReviewId) {
        const diff = rating - (existingRating || 0);
        await updateDoc(doc(db, 'users', sellerId, 'reviews', existingReviewId), { rating, updatedAt: serverTimestamp() });
        if (diff !== 0) await updateDoc(sellerRef, { ratingSum: increment(diff) });
      } else {
        await addDoc(collection(db, 'users', sellerId, 'reviews'), { reviewerId: user.uid, reviewerName: userProfile.username || 'مستخدم', rating, createdAt: serverTimestamp() });
        await updateDoc(sellerRef, { ratingSum: increment(rating), ratingCount: increment(1) });
      }
      setSubmitted(true);
      if (onRatingUpdated) onRatingUpdated();
      setTimeout(() => { onClose(); setSubmitted(false); setRating(0); }, 1500);
    } catch (e) { console.error(e); alert('حدث خطأ أثناء إضافة التقييم'); }
    finally { setSubmitting(false); }
  };

  const handleClose = () => { if (!submitting) { onClose(); setRating(existingRating || 0); setHoveredRating(0); setSubmitted(false); } };

  if (submitted) return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-box">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--bare-green)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="16 10 10 16 8 14"/></svg>
        <h2 className="modal-title">{isEditing ? 'تم تحديث التقييم!' : 'شكراً لتقييمك!'}</h2>
        <p className="modal-desc">تقييمك يساعد المشترين الآخرين</p>
      </div>
    </>
  );

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} />
      <div className="bottom-sheet">
        <div className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">{isEditing ? 'تعديل التقييم' : 'تقييم البائع'}</h2>
          <button onClick={handleClose} className="bottom-sheet-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <p className="form-hint" style={{ marginBottom: '16px', textAlign: 'center' }}>كيف تقيّم تجربتك مع {sellerName}؟</p>

        {/* Stars */}
        <div className="review-stars-input">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} disabled={submitting} className={`review-star-btn${(hoveredRating >= star || rating >= star) ? ' active' : ''}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill={(hoveredRating >= star || rating >= star) ? '#f59e0b' : 'none'} stroke={(hoveredRating >= star || rating >= star) ? '#f59e0b' : 'var(--bare-text-muted)'} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
          ))}
        </div>
        {rating > 0 && <p className="review-rating-text">{rating}/5</p>}

        <div className="filter-actions" style={{ marginTop: '20px' }}>
          <button onClick={handleClose} className="btn btn-secondary">إلغاء</button>
          <button onClick={handleSubmit} disabled={submitting || rating === 0} className="btn btn-primary">{submitting ? 'جاري الإرسال...' : isEditing ? 'تحديث التقييم' : 'إرسال التقييم'}</button>
        </div>
      </div>
    </>
  );
}
