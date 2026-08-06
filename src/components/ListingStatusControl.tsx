import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ListingStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/geo';

interface ListingStatusControlProps {
  adId: string;
  currentStatus?: string;
  onStatusChange?: (newStatus: ListingStatus) => void;
}

export default function ListingStatusControl({ adId, currentStatus, onStatusChange }: ListingStatusControlProps) {
  const [loading, setLoading] = useState(false);
  const normalizedStatus: ListingStatus = 
    (currentStatus === 'reserved' || currentStatus === 'sold') ? currentStatus : 'available';

  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (newStatus === normalizedStatus) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'ads', adId), { status: newStatus });
      onStatusChange?.(newStatus);
    } catch (e) {
      console.error('Error updating status:', e);
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
