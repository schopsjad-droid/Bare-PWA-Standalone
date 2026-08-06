import { ListingStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/geo';

interface StatusBadgeProps {
  listingStatus?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ listingStatus, size = 'sm' }: StatusBadgeProps) {
  // Treat missing listingStatus as 'available' (backward compatible with legacy ads)
  const normalizedStatus: ListingStatus = 
    (listingStatus === 'reserved' || listingStatus === 'sold') ? listingStatus : 'available';
  
  // Don't show badge for available (default state)
  if (normalizedStatus === 'available') return null;

  const label = STATUS_LABELS[normalizedStatus];
  const color = STATUS_COLORS[normalizedStatus];

  return (
    <span 
      className={`status-badge status-badge-${size}`}
      style={{ '--status-color': color } as React.CSSProperties}
    >
      {label}
    </span>
  );
}
