import { useState } from 'react';
import { Link } from 'react-router-dom';
import { statusOptions, priorityOptions, type TicketStatus, type TicketPriority, type TicketsListParams } from '../api';
import { useTickets, useTicketStats } from '../hooks';
import { useDebounce } from '../hooks/useDebounce';
import { formatDateShort, truncate } from '../lib/utils';
import {
  Card, TableSkeleton, EmptyState, ErrorState,
  StatusBadge, PriorityBadge, Button, Input, Select,
} from '../components';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');
  
  const debouncedSearch = useDebounce(search, 350);

  const params: TicketsListParams = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    page: 1,
    page_size: 50,
  };

  const { tickets, loading, error, fetchTickets } = useTickets(params);
  const { stats, loading: statsLoading, error: statsError } = useTicketStats();

  const hasFilters = search || statusFilter || priorityFilter;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as TicketStatus | '');
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriorityFilter(e.target.value as TicketPriority | '');
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={fetchTickets}
        title="Unable to load tickets"
      />
    );
  }

  // Show stats error inline if stats fail to load
  const statsDisplay = statsError ? (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total Tickets" value="–" icon={<TicketIcon />} />
      <StatCard title="Open" value="–" className="text-green-600" icon={<OpenIcon />} />
      <StatCard title="In Progress" value="–" className="text-blue-600" icon={<ProgressIcon />} />
      <StatCard title="Closed" value="–" className="text-gray-600" icon={<ClosedIcon />} />
    </div>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total Tickets" value={stats.total} icon={<TicketIcon />} />
      <StatCard title="Open" value={stats.open} className="text-green-600" icon={<OpenIcon />} />
      <StatCard title="In Progress" value={stats.in_progress} className="text-blue-600" icon={<ProgressIcon />} />
      <StatCard title="Closed" value={stats.closed} className="text-gray-600" icon={<ClosedIcon />} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and track customer support tickets</p>
        </div>
        <Link to="/tickets/new">
          <Button>+ New Ticket</Button>
        </Link>
      </div>

      <Card padding="sm">
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
                <p className="text-sm text-gray-500">Loading...</p>
                <p className="text-2xl font-bold text-gray-200">–</p>
              </div>
            ))}
          </div>
        ) : (
          statsDisplay
        )}
      </Card>

      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={handleSearchChange}
              helperText="Search by customer, email, subject, description, or ticket ID"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[160px]">
              <Select
                label="Status"
                options={[{ value: '', label: 'All Statuses' }, ...statusOptions.map(s => ({ value: s, label: s }))]}
                value={statusFilter}
                onChange={handleStatusChange}
              />
            </div>
            <div className="min-w-[160px]">
              <Select
                label="Priority"
                options={[{ value: '', label: 'All Priorities' }, ...priorityOptions.map(p => ({ value: p, label: p }))]}
                value={priorityFilter}
                onChange={handlePriorityChange}
              />
            </div>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters} className="h-10">
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No tickets found' : 'No tickets yet'}
            description={hasFilters 
              ? 'Try adjusting your search or filters to find tickets.' 
              : 'Create your first ticket to get started.'}
            action={!hasFilters && (
              <Link to="/tickets/new">
                <Button>Create Ticket</Button>
              </Link>
            )}
          />
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <Link to={`/tickets/${ticket.ticket_id}`} className="font-mono text-sm font-medium text-primary-600 hover:underline">
                        {ticket.ticket_id}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ticket.customer_name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{ticket.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900 max-w-md truncate" title={ticket.subject}>
                        {truncate(ticket.subject, 50)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDateShort(ticket.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <Link to={`/tickets/${ticket.ticket_id}`} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, className = 'text-primary-600', icon }: { title: string; value: number | string; className?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${className}`}>{value}</p>
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TicketIcon() {
  return (
    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClosedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}