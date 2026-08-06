import type { LocationPrecision } from '../utils/geo';

interface LocationPrivacySelectorProps {
  value: LocationPrecision;
  onChange: (value: LocationPrecision) => void;
}

export default function LocationPrivacySelector({ value, onChange }: LocationPrivacySelectorProps) {
  return (
    <div className="privacy-selector">
      <label className="label">دقة الموقع العام</label>
      <div className="privacy-options">
        <button
          type="button"
          className={`privacy-option${value === 'approximate' ? ' active' : ''}`}
          onClick={() => onChange('approximate')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" strokeDasharray="4 2"/><circle cx="12" cy="12" r="3"/></svg>
          <span className="privacy-option-label">تقريبي</span>
          <span className="privacy-option-desc">يُظهر المنطقة العامة فقط</span>
        </button>
        <button
          type="button"
          className={`privacy-option${value === 'exact' ? ' active' : ''}`}
          onClick={() => onChange('exact')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="privacy-option-label">دقيق</span>
          <span className="privacy-option-desc">يُظهر النقطة المحددة بالضبط</span>
        </button>
      </div>
      {value === 'approximate' && (
        <p className="privacy-hint">سيتم إظهار المنطقة العامة للمشترين دون الكشف عن موقعك الدقيق.</p>
      )}
      {value === 'exact' && (
        <p className="privacy-hint privacy-hint-warning">تنبيه: سيتمكن الجميع من رؤية الموقع المحدد بدقة. مناسب للمحلات والمكاتب.</p>
      )}
    </div>
  );
}
