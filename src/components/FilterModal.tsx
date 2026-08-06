import { useState, useEffect } from 'react';
import { SYRIAN_CITIES } from '../constants/categories';
import { STATUS_LABELS, type ListingStatus } from '../utils/geo';

export type SortOption = 'newest' | 'nearest' | 'price-asc' | 'price-desc' | 'most-viewed';
export interface FilterState {
  minPrice: string;
  maxPrice: string;
  sortBy: SortOption;
  city: string;
  distanceKm: string;
  listingStatus: string; // '' = all (excluding sold), 'available' | 'reserved' | 'sold'
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
  hasSearchCenter?: boolean;
}

export default function FilterModal({ isOpen, onClose, onApply, initialFilters, hasSearchCenter = false }: FilterModalProps) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [city, setCity] = useState(initialFilters.city || '');
  const [distanceKm, setDistanceKm] = useState(initialFilters.distanceKm || '');
  const [listingStatus, setListingStatus] = useState(initialFilters.listingStatus || '');

  useEffect(() => {
    setMinPrice(initialFilters.minPrice);
    setMaxPrice(initialFilters.maxPrice);
    setSortBy(initialFilters.sortBy);
    setCity(initialFilters.city || '');
    setDistanceKm(initialFilters.distanceKm || '');
    setListingStatus(initialFilters.listingStatus || '');
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleApply = () => { onApply({ minPrice, maxPrice, sortBy, city, distanceKm, listingStatus }); onClose(); };
  const handleReset = () => { setMinPrice(''); setMaxPrice(''); setSortBy(hasSearchCenter ? 'nearest' : 'newest'); setCity(''); setDistanceKm(''); setListingStatus(''); };
  const activeCount = [minPrice, maxPrice, city, distanceKm, listingStatus, (sortBy !== 'newest' && sortBy !== 'nearest') ? sortBy : ''].filter(Boolean).length;

  const sortOptions: { value: SortOption; label: string; disabled?: boolean }[] = [
    { value: 'newest', label: 'الأحدث أولاً' },
    { value: 'nearest', label: 'الأقرب', disabled: !hasSearchCenter },
    { value: 'price-asc', label: 'السعر: الأقل أولاً' },
    { value: 'price-desc', label: 'السعر: الأعلى أولاً' },
    { value: 'most-viewed', label: 'الأكثر مشاهدة' },
  ];

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">
            تصفية وترتيب
            {activeCount > 0 && <span className="badge badge-green">{activeCount}</span>}
          </h2>
          <button onClick={onClose} className="bottom-sheet-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        {/* Listing Status */}
        <div className="form-group">
          <label className="label">حالة الإعلان</label>
          <div className="filter-sort-options">
            <label className={`filter-sort-option${listingStatus === '' ? ' active' : ''}`}>
              <input type="radio" name="listingStatus" value="" checked={listingStatus === ''} onChange={() => setListingStatus('')} />
              <span>الكل (بدون المباع)</span>
            </label>
            {(Object.entries(STATUS_LABELS) as [ListingStatus, string][]).map(([key, label]) => (
              <label key={key} className={`filter-sort-option${listingStatus === key ? ' active' : ''}`}>
                <input type="radio" name="listingStatus" value={key} checked={listingStatus === key} onChange={() => setListingStatus(key)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
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
            {sortOptions.map(opt => (
              <label key={opt.value} className={`filter-sort-option${sortBy === opt.value ? ' active' : ''}${opt.disabled ? ' disabled' : ''}`}>
                <input type="radio" name="sortBy" value={opt.value} checked={sortBy === opt.value} onChange={(e) => setSortBy(e.target.value as SortOption)} disabled={opt.disabled} />
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
