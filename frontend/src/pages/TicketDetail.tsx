import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { statusOptions, priorityOptions, type TicketStatus, type TicketPriority } from '../api';
import { useTicketDetail } from '../hooks';
import { formatDate } from '../lib/utils';
import {
  Card, CardHeader, Button, Textarea, Select,
  StatusBadge, PriorityBadge, EmptyState, ErrorState, ConfirmDialog,
} from '../components';

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { ticket, loading, error, updateTicket, deleteTicket } = useTicketDetail(ticketId || null);
  
  const [editStatus, setEditStatus] = useState<TicketStatus | ''>('');
  const [editPriority, setEditPriority] = useState<TicketPriority | ''>('');
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async () => {
    const hasChanges = editStatus || editPriority || noteText.trim();
    if (!hasChanges) return;

    setUpdating(true);
    setUpdateError(null);
    
    try {
      const success = await updateTicket({
        status: editStatus || undefined,
        priority: editPriority || undefined,
        note: noteText.trim() || undefined,
      });
      
      if (success) {
        setEditStatus('');
        setEditPriority('');
        setNoteText('');
      }
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const success = await deleteTicket();
      if (success) {
        setShowDeleteConfirm(false);
        navigate('/');
      }
    } catch (err) {
      // Error is handled by the hook and will be shown via the main error state
      // The modal will remain open for retry
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorState
          title="Ticket not found"
          message={error || 'The ticket you are looking for does not exist.'}
          onRetry={() => navigate('/')}
          retryLabel="Back to Tickets"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {ticket.ticket_id}
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </h1>
            <p className="text-gray-500 mt-1">{ticket.subject}</p>
          </div>
        </div>
      </div>

      {updateError && (
        <ErrorState message={updateError} title="Update failed" />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Customer Information" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{ticket.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{ticket.customer_email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{formatDate(ticket.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{formatDate(ticket.updated_at)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Issue Details" />
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Notes & Activity" />
            {(!ticket.notes || ticket.notes.length === 0) ? (
              <EmptyState
                title="No notes yet"
                description="Add a note to track progress or communicate with the customer."
              />
            ) : (
              <div className="space-y-4">
                {ticket.notes.map((note) => (
                  <div key={note.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.note_text}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(note.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Update Ticket" />
            <div className="space-y-4">
              <div>
                <label className="label">Status</label>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setEditStatus(ticket.status)}
                    className="ml-auto"
                  >
                    Change
                  </Button>
                </div>
                {editStatus && (
                  <Select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                    options={statusOptions.map(s => ({ value: s, label: s }))}
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <label className="label">Priority</label>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setEditPriority(ticket.priority)}
                    className="ml-auto"
                  >
                    Change
                  </Button>
                </div>
                {editPriority && (
                  <Select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TicketPriority)}
                    options={priorityOptions.map(p => ({ value: p, label: p }))}
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <label className="label">Add Note</label>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this ticket..."
                  rows={3}
                />
              </div>

              {(editStatus || editPriority || noteText.trim()) && (
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setEditStatus('');
                      setEditPriority('');
                      setNoteText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} loading={updating}>
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="border-red-200">
            <CardHeader 
              title="Danger Zone" 
              subtitle="Irreversible actions"
            />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Deleting a ticket will permanently remove it and all associated notes.
              </p>
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Ticket
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Ticket"
        message={`Are you sure you want to delete ticket ${ticket.ticket_id}? This action cannot be undone. All associated notes will also be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}