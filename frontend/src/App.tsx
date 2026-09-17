import { Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { Dashboard, CreateTicket, TicketDetail } from './pages';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:ticketId" element={<TicketDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;