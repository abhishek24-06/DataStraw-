import { apiClient } from './client';
import type {
  TicketListItem,
  TicketDetail,
  CreateTicketRequest,
  CreateTicketResponse,
  UpdateTicketRequest,
  UpdateTicketResponse,
  TicketDeleteResponse,
  TicketStats,
  TicketsListParams,
  TicketStatus,
  TicketPriority,
} from '../types/ticket';

export const ticketsApi = {
  async create(data: CreateTicketRequest): Promise<CreateTicketResponse> {
    const response = await apiClient.post<CreateTicketResponse>('/tickets', data);
    return response.data;
  },

  async list(params: TicketsListParams = {}): Promise<TicketListItem[]> {
    const response = await apiClient.get<TicketListItem[]>('/tickets', { params });
    return response.data;
  },

  async getStats(): Promise<TicketStats> {
    const response = await apiClient.get<TicketStats>('/tickets/stats');
    return response.data;
  },

  async get(ticketId: string): Promise<TicketDetail> {
    const response = await apiClient.get<TicketDetail>(`/tickets/${ticketId}`);
    return response.data;
  },

  async update(ticketId: string, data: UpdateTicketRequest): Promise<UpdateTicketResponse> {
    const response = await apiClient.put<UpdateTicketResponse>(`/tickets/${ticketId}`, data);
    return response.data;
  },

  async delete(ticketId: string): Promise<TicketDeleteResponse> {
    const response = await apiClient.delete<TicketDeleteResponse>(`/tickets/${ticketId}`);
    return response.data;
  },
};

export const statusOptions: TicketStatus[] = ['Open', 'In Progress', 'Closed'];
export const priorityOptions: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];