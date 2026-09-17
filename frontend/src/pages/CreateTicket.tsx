import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, priorityOptions, type CreateTicketRequest } from '../api';
import { Button, Input, Textarea, Select, Card, ErrorState } from '../components';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTicketRequest>({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium',
  });
  const [errors, setErrors] = useState<Partial<CreateTicketRequest>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTicketRequest> = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }
    
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateTicketRequest) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateTicketRequest]) {
      setErrors((prev: Partial<CreateTicketRequest>) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await ticketsApi.create(formData);
      setCreatedTicketId(response.ticket_id);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/tickets/${response.ticket_id}`);
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success && createdTicketId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Created Successfully!</h1>
          <p className="mt-2 text-gray-600">Your support ticket has been created and assigned ID:</p>
          <p className="mt-1 text-xl font-mono font-bold text-primary-600">{createdTicketId}</p>
          <p className="mt-4 text-sm text-gray-500">Redirecting to ticket details...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
        <p className="text-gray-500 mt-1">Fill in the details below to create a new support ticket</p>
      </div>

      {submitError && (
        <ErrorState 
          message={submitError} 
          title="Failed to create ticket"
        />
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              error={errors.customer_name}
              placeholder="John Doe"
              required
              disabled={submitting}
            />
            <Input
              label="Customer Email"
              name="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={handleChange}
              error={errors.customer_email}
              placeholder="john@example.com"
              required
              disabled={submitting}
            />
          </div>

          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            error={errors.subject}
            placeholder="Brief description of the issue"
            required
            disabled={submitting}
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Detailed description of the issue..."
            required
            disabled={submitting}
            rows={6}
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions.map(p => ({ value: p, label: p }))}
            placeholder="Select priority"
            disabled={submitting}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {submitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}