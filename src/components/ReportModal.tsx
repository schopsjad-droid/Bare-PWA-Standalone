import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

interface ReportModalProps { isOpen: boolean; onClose: () => void; adId: string; adTitle: string; }

const REASONS = [
  { value: 'spam', label: 'محتوى مزعج أو إعلان مكرر' },
  { value: 'fake', label: 'إعلان مزيف أو احتيالي' },
  { value: 'inappropriate', label: 'محتوى غير لائق' },
  { value: 'wrong-category', label: 'فئة خاطئة' },
  { value: 'other', label: 'سبب آخر' }
];

export default function ReportModal({ isOpen, onClose, adId, adTitle }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) { alert('يرجى اختيار سبب الإبلاغ'); return; }
    if (!user) { alert('يجب تسجيل الدخول للإبلاغ'); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), { adId, adTitle, reporterId: user.uid, reason, details: details.trim() || null, createdAt: serverTimestamp() });
      setSubmitted(true);
      setTimeout(() => { onClose(); setSubmitted(false); setReason(''); setDetails(''); }, 2000);
    } catch (e) { console.error(e); alert('فشل إرسال البلاغ'); }
    finally { setSubmitting(false); }
  };

  if (submitted) return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--bare-green)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="16 10 10 16 8 14"/></svg>
        <h2 className="modal-title">تم الإبلاغ بنجاح</h2>
        <p className="modal-desc">شكراً لمساعدتنا في الحفاظ على جودة المنصة</p>
      </div>
    </>
  );

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">الإبلاغ عن إعلان</h2>
          <button onClick={onClose} className="bottom-sheet-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <p className="form-hint" style={{ marginBottom: '12px' }}>الإعلان: {adTitle}</p>

        <div className="form-group">
          <label className="label">سبب الإبلاغ</label>
          <div className="filter-sort-options">
            {REASONS.map(r => (
              <label key={r.value} className={`filter-sort-option${reason === r.value ? ' active' : ''}`}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={(e) => setReason(e.target.value)} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="label">تفاصيل إضافية (اختياري)</label>
          <textarea className="input form-textarea" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="أضف تفاصيل إضافية..." />
        </div>

        <div className="filter-actions">
          <button onClick={onClose} className="btn btn-secondary">إلغاء</button>
          <button onClick={handleSubmit} disabled={submitting || !reason} className="btn btn-danger">{submitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}</button>
        </div>
      </div>
    </>
  );
}
