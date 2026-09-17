import { getStatusBadgeClass, getPriorityBadgeClass } from '../lib/utils';
import type { TicketStatus, TicketPriority } from '../types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClass = getStatusBadgeClass(status);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`${baseClass} ${sizeClass}`}>
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const baseClass = getPriorityBadgeClass(priority);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`${baseClass} ${sizeClass}`}>
      {priority}
    </span>
  );
}