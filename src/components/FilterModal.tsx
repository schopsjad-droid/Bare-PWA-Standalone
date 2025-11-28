import { useState, useEffect } from 'react';

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
}

export default function FilterModal({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy);

  useEffect(() => {
    setMinPrice(initialFilters.minPrice);
    setMaxPrice(initialFilters.maxPrice);
    setSortBy(initialFilters.sortBy);
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ minPrice, maxPrice, sortBy });
    onClose();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
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
        onClick={onClose}
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
            🔍 تصفية النتائج
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-secondary)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Price Range Section */}
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
                  padding: '10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
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
                  padding: '10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Sort By Section */}
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
              { value: 'newest', label: '🆕 الأحدث أولاً', icon: '🆕' },
              { value: 'price-asc', label: '💵 السعر: الأقل أولاً', icon: '💵' },
              { value: 'price-desc', label: '💰 السعر: الأعلى أولاً', icon: '💰' },
              { value: 'most-viewed', label: '👁️ الأكثر مشاهدة', icon: '👁️' }
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

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '12px',
          marginTop: '24px'
        }}>
          <button
            onClick={handleReset}
            className="btn"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }}
          >
            مسح
          </button>
          <button
            onClick={handleApply}
            className="btn btn-primary"
          >
            تطبيق الفلاتر
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
