import { useState, useEffect, useCallback } from 'react';
import { ticketsApi, type TicketListItem, type TicketStats, type TicketsListParams, type TicketStatus, type TicketPriority } from '../api';

export function useTickets(initialParams: TicketsListParams = {}) {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<TicketsListParams>({
    page: 1,
    page_size: 20,
    ...initialParams,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.list(params);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateParams = useCallback((newParams: Partial<TicketsListParams>) => {
    setParams((prev: TicketsListParams) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  const clearSearch = useCallback(() => {
    setParams((prev: TicketsListParams) => ({ ...prev, search: undefined, page: 1 }));
  }, []);

  return {
    tickets,
    loading,
    error,
    params,
    fetchTickets,
    updateParams,
    clearSearch,
  };
}

export function useTicketStats() {
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, in_progress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

export function useTicketDetail(ticketId: string | null) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.get(ticketId);
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const updateTicket = useCallback(async (data: { status?: TicketStatus; priority?: TicketPriority; note?: string }) => {
    if (!ticketId) return;
    try {
      await ticketsApi.update(ticketId, data);
      await fetchTicket();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
      return false;
    }
  }, [ticketId, fetchTicket]);

  const deleteTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      await ticketsApi.delete(ticketId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
      return false;
    }
  }, [ticketId]);

  return { ticket, loading, error, refresh: fetchTicket, updateTicket, deleteTicket };
}

type TicketDetail = {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  notes: Array<{ id: number; note_text: string; created_at: string }>;
};