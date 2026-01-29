import { useState, useEffect } from 'react';
import { SYRIAN_CITIES } from '../constants/categories';

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'most-viewed';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  sortBy: SortOption;
  city: string;
}

export default function FilterModal({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);
  const [city, setCity] = useState(initialFilters.city || '');

  useEffect(() => {
    setMinPrice(initialFilters.minPrice);
    setMaxPrice(initialFilters.maxPrice);
    setSortBy(initialFilters.sortBy);
    setCity(initialFilters.city || '');
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ minPrice, maxPrice, sortBy, city });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCity('');
  };

  const activeFiltersCount = [
    minPrice,
    maxPrice,
    city,
    sortBy !== 'newest' ? sortBy : ''
  ].filter(Boolean).length;

  return (
    <>
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
        onClick={onClose}
      />
      
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
          maxHeight: '85vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔍 تصفية وترتيب
            {activeFiltersCount > 0 && (
              <span style={{
                backgroundColor: '#22c55e',
                color: 'white',
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                {activeFiltersCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'var(--text-primary)'
          }}>
            📍 المدينة
          </h3>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '15px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <option value="">جميع المدن</option>
            {SYRIAN_CITIES.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'var(--text-primary)'
          }}>
            💰 نطاق السعر (ل.س)
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                marginBottom: '6px',
                color: 'var(--text-secondary)'
              }}>
                أقل سعر
              </label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '15px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                marginBottom: '6px',
                color: 'var(--text-secondary)'
              }}>
                أعلى سعر
              </label>
              <input
                type="number"
                placeholder="∞"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '15px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'var(--text-primary)'
          }}>
            📊 ترتيب حسب
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { value: 'newest', label: 'الأحدث أولاً', icon: '🆕' },
              { value: 'price-asc', label: 'السعر: الأقل أولاً', icon: '💵' },
              { value: 'price-desc', label: 'السعر: الأعلى أولاً', icon: '💰' },
              { value: 'most-viewed', label: 'الأكثر مشاهدة', icon: '👁️' }
            ].map((option) => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: `2px solid ${sortBy === option.value ? '#22c55e' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: sortBy === option.value ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="sortBy"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  style={{
                    marginLeft: '12px',
                    width: '18px',
                    height: '18px',
                    accentColor: '#22c55e'
                  }}
                />
                <span style={{ marginLeft: '8px', fontSize: '16px' }}>{option.icon}</span>
                <span style={{
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  fontWeight: sortBy === option.value ? '600' : '400'
                }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '12px',
          marginTop: '24px',
          paddingBottom: '20px'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            مسح الكل
          </button>
          <button
            onClick={handleApply}
            style={{
              padding: '14px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            تطبيق الفلاتر {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
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
