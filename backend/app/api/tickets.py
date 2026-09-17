from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.session import get_db
from app.services.ticket_service import (
    create_ticket,
    get_ticket_by_id,
    get_tickets,
    count_tickets,
    update_ticket,
    get_ticket_stats,
    delete_ticket,
)
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketListResponse,
    TicketCreateResponse,
    TicketUpdateResponse,
    TicketDeleteResponse,
)
from app.models.ticket import TicketStatus, TicketPriority

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("", response_model=TicketCreateResponse, status_code=status.HTTP_201_CREATED)
def create_ticket_endpoint(ticket_data: TicketCreate, db: Session = Depends(get_db)):
    try:
        ticket = create_ticket(db, ticket_data)
        return TicketCreateResponse(ticket_id=ticket.ticket_id, created_at=ticket.created_at)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create ticket")


@router.get("", response_model=List[TicketListResponse])
def list_tickets(
    search: Optional[str] = Query(None, description="Search across customer name, email, subject, description, ticket ID"),
    status: Optional[TicketStatus] = Query(None, description="Filter by status"),
    priority: Optional[TicketPriority] = Query(None, description="Filter by priority"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    tickets = get_tickets(db, search=search, status=status, priority=priority, skip=skip, limit=page_size)
    return tickets


@router.get("/stats", response_model=dict)
def get_stats(db: Session = Depends(get_db)):
    return get_ticket_stats(db)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket_endpoint(ticket_id: str, update_data: TicketUpdate, db: Session = Depends(get_db)):
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    try:
        updated_ticket = update_ticket(db, ticket, update_data)
        return TicketUpdateResponse(success=True, updated_at=updated_ticket.updated_at)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update ticket")


@router.delete("/{ticket_id}", response_model=TicketDeleteResponse, status_code=status.HTTP_200_OK)
def delete_ticket_endpoint(ticket_id: str, db: Session = Depends(get_db)):
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    try:
        delete_ticket(db, ticket)
        return TicketDeleteResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete ticket")