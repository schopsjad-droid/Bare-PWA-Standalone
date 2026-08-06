interface MapFallbackProps {
  type?: 'unsupported' | 'error';
  onRetry?: () => void;
}

export default function MapFallback({ type = 'unsupported', onRetry }: MapFallbackProps) {
  return (
    <div className="map-fallback">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--bare-text-muted)" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      {type === 'unsupported' ? (
        <p>هذا الجهاز أو المتصفح لا يدعم عرض الخريطة.</p>
      ) : (
        <>
          <p>تعذر تحميل الخريطة. تحقق من الاتصال وحاول مجدداً.</p>
          {onRetry && (
            <button onClick={onRetry} className="btn btn-primary" style={{ marginTop: '12px' }}>
              إعادة المحاولة
            </button>
          )}
        </>
      )}
    </div>
  );
}
