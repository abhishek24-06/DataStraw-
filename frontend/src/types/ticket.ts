export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TicketListItem {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  note_text: string;
  created_at: string;
}

export interface TicketDetail extends TicketListItem {
  description: string;
  notes: Note[];
}

export interface CreateTicketRequest {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority: TicketPriority;
}

export interface CreateTicketResponse {
  ticket_id: string;
  created_at: string;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  note?: string;
}

export interface UpdateTicketResponse {
  success: boolean;
  updated_at: string;
}

export interface TicketDeleteResponse {
  success: boolean;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
}

export interface TicketsListParams {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  page_size?: number;
}