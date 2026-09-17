from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.ticket import TicketStatus, TicketPriority


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    priority: TicketPriority = TicketPriority.MEDIUM


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    note: Optional[str] = Field(None, min_length=1)


class NoteResponse(BaseModel):
    id: int
    note_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime


class TicketDeleteResponse(BaseModel):
    success: bool