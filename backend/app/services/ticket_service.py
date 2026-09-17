from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List
from app.models.ticket import Ticket, Note, TicketStatus, TicketPriority
from app.schemas.ticket import TicketCreate, TicketUpdate
import re


def generate_ticket_id(db: Session) -> str:
    last_ticket = db.query(Ticket).order_by(Ticket.id.desc()).first()
    if last_ticket and last_ticket.ticket_id:
        match = re.match(r"TKT-(\d+)", last_ticket.ticket_id)
        if match:
            next_num = int(match.group(1)) + 1
            return f"TKT-{next_num:06d}"
    return "TKT-000001"


def create_ticket(db: Session, ticket_data: TicketCreate) -> Ticket:
    ticket_id = generate_ticket_id(db)
    ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=ticket_data.customer_name.strip(),
        customer_email=ticket_data.customer_email.strip().lower(),
        subject=ticket_data.subject.strip(),
        description=ticket_data.description.strip(),
        priority=ticket_data.priority,
        status=TicketStatus.OPEN,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_ticket_by_id(db: Session, ticket_id: str) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def get_tickets(
    db: Session,
    search: Optional[str] = None,
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[Ticket]:
    query = db.query(Ticket)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.customer_name.ilike(search_term),
                Ticket.customer_email.ilike(search_term),
                Ticket.subject.ilike(search_term),
                Ticket.description.ilike(search_term),
                Ticket.ticket_id.ilike(search_term),
            )
        )

    if status:
        query = query.filter(Ticket.status == status)

    if priority:
        query = query.filter(Ticket.priority == priority)

    query = query.order_by(Ticket.updated_at.desc(), Ticket.created_at.desc())
    return query.offset(skip).limit(limit).all()


def count_tickets(
    db: Session,
    search: Optional[str] = None,
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
) -> int:
    query = db.query(func.count(Ticket.id))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.customer_name.ilike(search_term),
                Ticket.customer_email.ilike(search_term),
                Ticket.subject.ilike(search_term),
                Ticket.description.ilike(search_term),
                Ticket.ticket_id.ilike(search_term),
            )
        )

    if status:
        query = query.filter(Ticket.status == status)

    if priority:
        query = query.filter(Ticket.priority == priority)

    return query.scalar() or 0


def update_ticket(db: Session, ticket: Ticket, update_data: TicketUpdate) -> Ticket:
    updated = False

    if update_data.status is not None and update_data.status != ticket.status:
        ticket.status = update_data.status
        updated = True

    if update_data.priority is not None and update_data.priority != ticket.priority:
        ticket.priority = update_data.priority
        updated = True

    if update_data.note and update_data.note.strip():
        note = Note(ticket_id=ticket.id, note_text=update_data.note.strip())
        db.add(note)
        updated = True

    if updated:
        db.commit()
        db.refresh(ticket)

    return ticket


def get_ticket_stats(db: Session) -> dict:
    total = db.query(func.count(Ticket.id)).scalar() or 0
    open_count = db.query(func.count(Ticket.id)).filter(Ticket.status == TicketStatus.OPEN).scalar() or 0
    in_progress_count = db.query(func.count(Ticket.id)).filter(Ticket.status == TicketStatus.IN_PROGRESS).scalar() or 0
    closed_count = db.query(func.count(Ticket.id)).filter(Ticket.status == TicketStatus.CLOSED).scalar() or 0

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress_count,
        "closed": closed_count,
    }


def delete_ticket(db: Session, ticket: Ticket) -> None:
    db.delete(ticket)
    db.commit()