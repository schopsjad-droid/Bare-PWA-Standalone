import { ListingStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/geo';

interface StatusBadgeProps {
  status?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  // Treat missing or 'approved' status as 'available'
  const normalizedStatus: ListingStatus = 
    (status === 'reserved' || status === 'sold') ? status : 'available';
  
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
