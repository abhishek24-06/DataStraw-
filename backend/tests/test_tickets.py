import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import get_db, Base
from app.models.ticket import Ticket, Note, TicketStatus, TicketPriority
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="function")
def sample_ticket(db_session):
    ticket = Ticket(
        ticket_id="TKT-000001",
        customer_name="Test User",
        customer_email="test@example.com",
        subject="Test Subject",
        description="Test Description",
        status=TicketStatus.OPEN,
        priority=TicketPriority.MEDIUM,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(ticket)
    db_session.commit()
    db_session.refresh(ticket)
    return ticket


class TestCreateTicket:
    def test_create_ticket_success(self):
        response = client.post(
            "/api/tickets",
            json={
                "customer_name": "John Doe",
                "customer_email": "john@example.com",
                "subject": "Test Issue",
                "description": "This is a test issue",
                "priority": "High",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert "ticket_id" in data
        assert data["ticket_id"].startswith("TKT-")
        assert "created_at" in data

    def test_create_ticket_invalid_email(self):
        response = client.post(
            "/api/tickets",
            json={
                "customer_name": "John Doe",
                "customer_email": "not-an-email",
                "subject": "Test Issue",
                "description": "This is a test issue",
            },
        )
        assert response.status_code == 422

    def test_create_ticket_missing_required_fields(self):
        response = client.post(
            "/api/tickets",
            json={
                "customer_name": "John Doe",
            },
        )
        assert response.status_code == 422

    def test_create_ticket_empty_fields(self):
        response = client.post(
            "/api/tickets",
            json={
                "customer_name": "",
                "customer_email": "john@example.com",
                "subject": "Test",
                "description": "Desc",
            },
        )
        assert response.status_code == 422


class TestListTickets:
    def test_list_tickets_empty(self, db_session):
        response = client.get("/api/tickets")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_tickets_with_data(self, sample_ticket):
        response = client.get("/api/tickets")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["ticket_id"] == "TKT-000001"
        assert data[0]["customer_name"] == "Test User"

    def test_list_tickets_pagination(self, sample_ticket):
        response = client.get("/api/tickets?page=1&page_size=10")
        assert response.status_code == 200
        assert len(response.json()) == 1


class TestSearchTickets:
    def test_search_by_customer_name(self, sample_ticket):
        response = client.get("/api/tickets?search=Test")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_search_by_email(self, sample_ticket):
        response = client.get("/api/tickets?search=test@example")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_search_by_subject(self, sample_ticket):
        response = client.get("/api/tickets?search=Subject")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_search_no_results(self, sample_ticket):
        response = client.get("/api/tickets?search=nonexistent")
        assert response.status_code == 200
        assert response.json() == []


class TestFilterByStatus:
    def test_filter_open(self, sample_ticket):
        response = client.get("/api/tickets?status=Open")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "Open"

    def test_filter_in_progress(self, sample_ticket, db_session):
        sample_ticket.status = TicketStatus.IN_PROGRESS
        db_session.commit()
        db_session.refresh(sample_ticket)

        response = client.get("/api/tickets?status=In%20Progress")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "In Progress"

    def test_filter_closed(self, sample_ticket):
        response = client.get("/api/tickets?status=Closed")
        assert response.status_code == 200
        assert response.json() == []

    def test_invalid_status(self, sample_ticket):
        response = client.get("/api/tickets?status=Invalid")
        assert response.status_code == 422


class TestGetTicketDetail:
    def test_get_ticket_success(self, sample_ticket):
        response = client.get("/api/tickets/TKT-000001")
        assert response.status_code == 200
        data = response.json()
        assert data["ticket_id"] == "TKT-000001"
        assert data["customer_name"] == "Test User"
        assert "notes" in data

    def test_get_ticket_not_found(self):
        response = client.get("/api/tickets/TKT-999999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Ticket not found"


class TestUpdateTicket:
    def test_update_status(self, sample_ticket):
        response = client.put(
            "/api/tickets/TKT-000001",
            json={"status": "In Progress"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        get_response = client.get("/api/tickets/TKT-000001")
        assert get_response.json()["status"] == "In Progress"

    def test_update_priority(self, sample_ticket):
        response = client.put(
            "/api/tickets/TKT-000001",
            json={"priority": "Urgent"},
        )
        assert response.status_code == 200
        get_response = client.get("/api/tickets/TKT-000001")
        assert get_response.json()["priority"] == "Urgent"

    def test_add_note(self, sample_ticket):
        response = client.put(
            "/api/tickets/TKT-000001",
            json={"note": "This is a test note"},
        )
        assert response.status_code == 200
        get_response = client.get("/api/tickets/TKT-000001")
        notes = get_response.json()["notes"]
        assert len(notes) == 1
        assert notes[0]["note_text"] == "This is a test note"

    def test_update_status_and_add_note(self, sample_ticket):
        response = client.put(
            "/api/tickets/TKT-000001",
            json={"status": "Closed", "note": "Resolved the issue"},
        )
        assert response.status_code == 200
        get_response = client.get("/api/tickets/TKT-000001")
        data = get_response.json()
        assert data["status"] == "Closed"
        assert len(data["notes"]) == 1
        assert data["notes"][0]["note_text"] == "Resolved the issue"

    def test_empty_note_not_created(self, sample_ticket):
        response = client.put(
            "/api/tickets/TKT-000001",
            json={"note": ""},
        )
        assert response.status_code == 422

    def test_update_nonexistent_ticket(self):
        response = client.put(
            "/api/tickets/TKT-999999",
            json={"status": "Closed"},
        )
        assert response.status_code == 404

    def test_invalid_priority(self, sample_ticket):
        response = client.put(
            "/api/tickets/TKT-000001",
            json={"priority": "Invalid"},
        )
        assert response.status_code == 422


class TestStats:
    def test_get_stats(self, sample_ticket):
        response = client.get("/api/tickets/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["open"] == 1
        assert data["in_progress"] == 0
        assert data["closed"] == 0


class TestHealth:
    def test_health_check(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["ok", "degraded"]


class TestCombinedSearchAndFilter:
    def test_search_and_filter_together(self, sample_ticket):
        response = client.get("/api/tickets?status=Open&search=Test")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_search_and_filter_no_match(self, sample_ticket):
        response = client.get("/api/tickets?status=Closed&search=Test")
        assert response.status_code == 200
        assert response.json() == []


class TestDeleteTicket:
    def test_delete_ticket_success(self, sample_ticket):
        response = client.delete("/api/tickets/TKT-000001")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        get_response = client.get("/api/tickets/TKT-000001")
        assert get_response.status_code == 404

    def test_delete_nonexistent_ticket(self):
        response = client.delete("/api/tickets/TKT-999999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Ticket not found"

    def test_delete_ticket_with_notes(self, sample_ticket, db_session):
        ticket_id = sample_ticket.id
        note = Note(
            ticket_id=ticket_id,
            note_text="Test note",
            created_at=datetime.utcnow(),
        )
        db_session.add(note)
        db_session.commit()

        response = client.delete("/api/tickets/TKT-000001")
        assert response.status_code == 200

        get_response = client.get("/api/tickets/TKT-000001")
        assert get_response.status_code == 404

        # Query notes count using the ticket_id to avoid session issues with deleted ticket
        notes_count = db_session.query(func.count(Note.id)).filter(Note.ticket_id == ticket_id).scalar()
        assert notes_count == 0

    def test_delete_ticket_then_list(self, sample_ticket):
        response = client.delete("/api/tickets/TKT-000001")
        assert response.status_code == 200

        list_response = client.get("/api/tickets")
        assert list_response.status_code == 200
        assert list_response.json() == []

    def test_get_deleted_ticket_returns_404(self, sample_ticket):
        response = client.delete("/api/tickets/TKT-000001")
        assert response.status_code == 200

        get_response = client.get("/api/tickets/TKT-000001")
        assert get_response.status_code == 404