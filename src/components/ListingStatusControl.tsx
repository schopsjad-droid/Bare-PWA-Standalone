import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ListingStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/geo';

interface ListingStatusControlProps {
  adId: string;
  currentListingStatus?: string;
  onStatusChange?: (newStatus: ListingStatus) => void;
}

export default function ListingStatusControl({ adId, currentListingStatus, onStatusChange }: ListingStatusControlProps) {
  const [loading, setLoading] = useState(false);
  const normalizedStatus: ListingStatus = 
    (currentListingStatus === 'reserved' || currentListingStatus === 'sold') ? currentListingStatus : 'available';

  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (newStatus === normalizedStatus) return;
    setLoading(true);
    try {
      // Only update listingStatus - never touch the moderation 'status' field
      await updateDoc(doc(db, 'ads', adId), { listingStatus: newStatus });
      onStatusChange?.(newStatus);
    } catch (e) {
      console.error('Error updating listingStatus:', e);
      alert('فشل تحديث حالة الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const statuses: ListingStatus[] = ['available', 'reserved', 'sold'];

  return (
    <div className="status-control">
      <label className="label">حالة الإعلان</label>
      <div className="status-control-options">
        {statuses.map(s => (
          <button
            key={s}
            type="button"
            disabled={loading}
            className={`status-control-btn${normalizedStatus === s ? ' active' : ''}`}
            style={{ '--sc-color': STATUS_COLORS[s] } as React.CSSProperties}
            onClick={() => handleStatusChange(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
