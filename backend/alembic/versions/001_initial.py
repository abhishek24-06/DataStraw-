"""initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'tickets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticket_id', sa.String(length=20), nullable=False),
        sa.Column('customer_name', sa.String(length=255), nullable=False),
        sa.Column('customer_email', sa.String(length=255), nullable=False),
        sa.Column('subject', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('Open', 'In Progress', 'Closed', name='ticketstatus'), nullable=False),
        sa.Column('priority', sa.Enum('Low', 'Medium', 'High', 'Urgent', name='ticketpriority'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_id')
    )
    op.create_index('ix_tickets_ticket_id', 'tickets', ['ticket_id'], unique=True)
    op.create_index('ix_tickets_customer_email', 'tickets', ['customer_email'])
    op.create_index('ix_tickets_status', 'tickets', ['status'])
    op.create_index('ix_tickets_created_at', 'tickets', ['created_at'])
    op.create_index('ix_tickets_status_created_at', 'tickets', ['status', 'created_at'])

    op.create_table(
        'notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticket_id', sa.Integer(), nullable=False),
        sa.Column('note_text', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_notes_ticket_id', 'notes', ['ticket_id'])


def downgrade() -> None:
    op.drop_index('ix_notes_ticket_id', table_name='notes')
    op.drop_table('notes')
    op.drop_index('ix_tickets_status_created_at', table_name='tickets')
    op.drop_index('ix_tickets_created_at', table_name='tickets')
    op.drop_index('ix_tickets_status', table_name='tickets')
    op.drop_index('ix_tickets_customer_email', table_name='tickets')
    op.drop_index('ix_tickets_ticket_id', table_name='tickets')
    op.drop_table('tickets')
    op.execute('DROP TYPE ticketstatus')
    op.execute('DROP TYPE ticketpriority')