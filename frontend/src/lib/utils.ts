export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Open':
      return 'badge-open';
    case 'In Progress':
      return 'badge-in-progress';
    case 'Closed':
      return 'badge-closed';
    default:
      return 'badge';
  }
}

export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'Low':
      return 'badge-low';
    case 'Medium':
      return 'badge-medium';
    case 'High':
      return 'badge-high';
    case 'Urgent':
      return 'badge-urgent';
    default:
      return 'badge';
  }
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}