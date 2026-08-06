import { useState, useEffect } from 'react';
import { SYRIAN_CITIES } from '../constants/categories';

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'most-viewed';
export interface FilterState { minPrice: string; maxPrice: string; sortBy: SortOption; city: string; }

interface FilterModalProps { isOpen: boolean; onClose: () => void; onApply: (filters: FilterState) => void; initialFilters: FilterState; }

export default function FilterModal({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [city, setCity] = useState(initialFilters.city || '');

  useEffect(() => { setMinPrice(initialFilters.minPrice); setMaxPrice(initialFilters.maxPrice); setSortBy(initialFilters.sortBy); setCity(initialFilters.city || ''); }, [initialFilters]);

  if (!isOpen) return null;

  const handleApply = () => { onApply({ minPrice, maxPrice, sortBy, city }); onClose(); };
  const handleReset = () => { setMinPrice(''); setMaxPrice(''); setSortBy('newest'); setCity(''); };
  const activeCount = [minPrice, maxPrice, city, sortBy !== 'newest' ? sortBy : ''].filter(Boolean).length;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        {/* Header */}
        <div className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">
            تصفية وترتيب
            {activeCount > 0 && <span className="badge badge-green">{activeCount}</span>}
          </h2>
          <button onClick={onClose} className="bottom-sheet-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        {/* City */}
        <div className="form-group">
          <label className="label">المدينة</label>
          <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">جميع المدن</option>
            {SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Price Range */}
        <div className="form-group">
          <label className="label">نطاق السعر (ل.س)</label>
          <div className="filter-price-row">
            <div className="filter-price-field"><span className="form-hint">أقل سعر</span><input type="number" className="input" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} /></div>
            <div className="filter-price-field"><span className="form-hint">أعلى سعر</span><input type="number" className="input" placeholder="∞" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} /></div>
          </div>
        </div>

        {/* Sort */}
        <div className="form-group">
          <label className="label">ترتيب حسب</label>
          <div className="filter-sort-options">
            {([
              { value: 'newest', label: 'الأحدث أولاً' },
              { value: 'price-asc', label: 'السعر: الأقل أولاً' },
              { value: 'price-desc', label: 'السعر: الأعلى أولاً' },
              { value: 'most-viewed', label: 'الأكثر مشاهدة' }
            ] as const).map(opt => (
              <label key={opt.value} className={`filter-sort-option${sortBy === opt.value ? ' active' : ''}`}>
                <input type="radio" name="sortBy" value={opt.value} checked={sortBy === opt.value} onChange={(e) => setSortBy(e.target.value as SortOption)} />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="filter-actions">
          <button onClick={handleReset} className="btn btn-secondary">مسح الكل</button>
          <button onClick={handleApply} className="btn btn-primary">تطبيق {activeCount > 0 && `(${activeCount})`}</button>
        </div>
      </div>
    </>
  );
}
