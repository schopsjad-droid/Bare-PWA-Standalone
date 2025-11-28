import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../utils/favorites';

interface FavoriteButtonProps {
  adId: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function FavoriteButton({ adId, size = 'medium', showLabel = false }: FavoriteButtonProps) {
  const { user, userProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if ad is in favorites
  useEffect(() => {
    if (userProfile?.favorites) {
      setIsFavorite(userProfile.favorites.includes(adId));
    }
  }, [userProfile, adId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a link
    e.stopPropagation();

    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    try {
      await toggleFavorite(user.uid, adId, isFavorite);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('حدث خطأ. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const sizeStyles = {
    small: { fontSize: '20px', padding: '4px' },
    medium: { fontSize: '24px', padding: '8px' },
    large: { fontSize: '32px', padding: '12px' }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        ...sizeStyles[size],
        background: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        borderRadius: '50%',
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
    >
      <span style={{
        filter: isFavorite ? 'none' : 'grayscale(100%)',
        transition: 'filter 0.2s'
      }}>
        {isFavorite ? '❤️' : '🤍'}
      </span>
      {showLabel && (
        <span style={{
          marginRight: '8px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          fontWeight: 500
        }}>
          {isFavorite ? 'محفوظ' : 'حفظ'}
        </span>
      )}
    </button>
  );
}
