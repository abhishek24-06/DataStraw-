export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg className={`animate-spin text-primary-600 ${sizeClasses[size]}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-container">
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <LoadingSkeleton className="h-4 w-24" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <LoadingSkeleton className="h-4 w-32" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <LoadingSkeleton className="h-4 w-40" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <LoadingSkeleton className="h-4 w-20" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <LoadingSkeleton className="h-4 w-24" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <LoadingSkeleton className="h-4 w-20" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-4"><LoadingSkeleton className="h-4 w-24" /></td>
              <td className="px-4 py-4"><LoadingSkeleton className="h-4 w-32" /></td>
              <td className="px-4 py-4"><LoadingSkeleton className="h-4 w-40" /></td>
              <td className="px-4 py-4"><LoadingSkeleton className="h-4 w-20" /></td>
              <td className="px-4 py-4"><LoadingSkeleton className="h-4 w-24" /></td>
              <td className="px-4 py-4"><LoadingSkeleton className="h-4 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}