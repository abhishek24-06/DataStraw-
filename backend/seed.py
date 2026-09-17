from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.models.ticket import Ticket, Note, TicketStatus, TicketPriority
from datetime import datetime, timedelta, timezone
import random


def seed_database():
    db = SessionLocal()
    try:
        existing = db.query(Ticket).first()
        if existing:
            print("Database already seeded, skipping...")
            return

        tickets_data = [
            {
                "customer_name": "Sarah Johnson",
                "customer_email": "sarah.johnson@email.com",
                "subject": "Delayed order #ORD-4521",
                "description": "My order ORD-4521 was supposed to arrive on March 15th but it's now March 20th and still hasn't shipped. Tracking shows no updates since March 12th. Can you please investigate?",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.HIGH,
                "days_ago": 2,
                "notes": [
                    "Customer contacted via email regarding delay. Escalated to logistics team.",
                    "Logistics confirms warehouse delay due to inventory sync issue. Expected ship date: March 22.",
                ],
            },
            {
                "customer_name": "Michael Chen",
                "customer_email": "mchen@example.com",
                "subject": "Damaged product received",
                "description": "Received package today but the ceramic vase (SKU: CER-789) arrived shattered. Packaging was intact but product was broken inside. Attached photos of damage. Need replacement or refund.",
                "status": TicketStatus.IN_PROGRESS,
                "priority": TicketPriority.URGENT,
                "days_ago": 5,
                "notes": [
                    "Photos received and verified. Initiating replacement shipment with expedited shipping.",
                    "Replacement order REP-3341 created. Tracking will be sent once shipped.",
                ],
            },
            {
                "customer_name": "Emily Rodriguez",
                "customer_email": "emily.r@gmail.com",
                "subject": "Incorrect item delivered",
                "description": "Ordered blue cotton t-shirt (SKU: TSH-BLU-M) but received red polyester shirt (SKU: TSH-RED-L). Wrong color, wrong material, wrong size. Please arrange return and send correct item.",
                "status": TicketStatus.CLOSED,
                "priority": TicketPriority.MEDIUM,
                "days_ago": 12,
                "notes": [
                    "Return label emailed to customer. Correct item shipped with order COR-2210.",
                    "Customer confirmed receipt of correct item. Case closed.",
                ],
            },
            {
                "customer_name": "David Park",
                "customer_email": "david.park@example.com",
                "subject": "Refund request for cancelled subscription",
                "description": "Cancelled my Pro subscription on Feb 28th but was charged $49.99 on March 1st. According to terms, cancellation should stop next billing cycle. Requesting refund of the March charge.",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.MEDIUM,
                "days_ago": 1,
                "notes": [
                    "Verified cancellation date. Billing team notified to process refund.",
                ],
            },
            {
                "customer_name": "Lisa Thompson",
                "customer_email": "lisa.thompson@example.com",
                "subject": "Payment failure on invoice INV-8842",
                "description": "Tried to pay invoice INV-8842 ($1,250.00) but payment failed with error 'insufficient funds' despite having sufficient balance. Bank confirmed no issues on their end. Need alternative payment method or retry.",
                "status": TicketStatus.IN_PROGRESS,
                "priority": TicketPriority.HIGH,
                "days_ago": 3,
                "notes": [
                    "Payment gateway logs show temporary network timeout. Retrying payment now.",
                    "Payment succeeded on retry. Invoice marked as paid. Customer notified.",
                ],
            },
            {
                "customer_name": "James Wilson",
                "customer_email": "jwilson@example.com",
                "subject": "Account access issue - 2FA not working",
                "description": "Cannot access account because 2FA authenticator app codes are not accepted. Tried multiple codes, time is synced. Backup codes also not working. Need account recovery assistance.",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.URGENT,
                "days_ago": 0,
                "notes": [
                    "Security team reviewing. Temporary access link sent to registered email.",
                ],
            },
            {
                "customer_name": "Amanda Foster",
                "customer_email": "amanda.foster@example.com",
                "subject": "Missing item from order ORD-7734",
                "description": "Order ORD-7734 had 3 items but only 2 arrived. Missing: Wireless mouse (SKU: ACC-MSE-01). Packing slip shows 3 items. Warehouse may have missed it.",
                "status": TicketStatus.CLOSED,
                "priority": TicketPriority.LOW,
                "days_ago": 18,
                "notes": [
                    "Warehouse confirmed missing item. Shipped separately with tracking TRK-9921.",
                    "Customer confirmed receipt. Closing ticket.",
                ],
            },
            {
                "customer_name": "Robert Kim",
                "customer_email": "robert.kim@example.com",
                "subject": "Duplicate charge on credit card",
                "description": "Noticed two identical charges of $89.99 on March 10th for the same subscription. Only one should have been charged. Please reverse the duplicate charge.",
                "status": TicketStatus.IN_PROGRESS,
                "priority": TicketPriority.HIGH,
                "days_ago": 4,
                "notes": [
                    "Duplicate charge confirmed in payment processor. Refund initiated for second charge.",
                    "Refund processed. Customer should see credit in 3-5 business days.",
                ],
            },
            {
                "customer_name": "Jennifer Lopez",
                "customer_email": "jlopez@example.com",
                "subject": "Shipping address change request",
                "description": "Need to update shipping address for pending order ORD-9102. Current address on file is old office. New address: 450 Design Blvd, Suite 300, San Francisco, CA 94105. Order not yet shipped per tracking.",
                "status": TicketStatus.CLOSED,
                "priority": TicketPriority.MEDIUM,
                "days_ago": 8,
                "notes": [
                    "Address updated in system before shipment. Order will ship to new address.",
                    "Order shipped to new address. Tracking updated.",
                ],
            },
            {
                "customer_name": "Thomas Anderson",
                "customer_email": "tanderson@example.com",
                "subject": "Product quality concern - fabric pilling",
                "description": "Purchased premium wool sweater (SKU: KNT-WOOL-L) two weeks ago. Already showing significant pilling under arms and sides. This seems like a manufacturing defect for a $120 item. Requesting exchange or refund.",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.MEDIUM,
                "days_ago": 6,
                "notes": [
                    "Quality team reviewing photos. Similar reports on this SKU batch.",
                ],
            },
            {
                "customer_name": "Maria Santos",
                "customer_email": "maria.santos@example.com",
                "subject": "Subscription upgrade not applied",
                "description": "Upgraded from Basic to Pro plan on March 5th but account still shows Basic features. Billing shows Pro charge of $29.99. Tried logging out/in, no change.",
                "status": TicketStatus.IN_PROGRESS,
                "priority": TicketPriority.HIGH,
                "days_ago": 2,
                "notes": [
                    "Provisioning service had delayed sync. Manually triggered plan update.",
                    "Features now active. Customer confirmed access to Pro features.",
                ],
            },
            {
                "customer_name": "Kevin O'Brien",
                "customer_email": "kobrien@example.com",
                "subject": "Gift card not redeeming",
                "description": "Received $50 gift card for birthday. Code GC-8844-2211 returns 'invalid code' at checkout. Code hasn't been used before. Purchased from official store.",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.MEDIUM,
                "days_ago": 1,
                "notes": [
                    "Gift card system shows code as unused but flagged. Investigating batch issue.",
                ],
            },
            {
                "customer_name": "Rachel Green",
                "customer_email": "rachel.green@example.com",
                "subject": "Size exchange request",
                "description": "Ordered dress (SKU: DRS-FLORAL-M) but runs small. Need to exchange for Large. Original order ORD-5567. Return window still open (14 days).",
                "status": TicketStatus.CLOSED,
                "priority": TicketPriority.LOW,
                "days_ago": 15,
                "notes": [
                    "Exchange authorized. Return label sent. Large size reserved.",
                    "Exchange completed. Customer satisfied.",
                ],
            },
            {
                "customer_name": "Alex Turner",
                "customer_email": "alex.turner@example.com",
                "subject": "Wrong billing amount charged",
                "description": "Annual plan should be $119.88/year ($9.99/mo) but was charged $149.88. Discount code ANNUAL10 not applied at checkout even though it was entered. Need $30 refund.",
                "status": TicketStatus.IN_PROGRESS,
                "priority": TicketPriority.MEDIUM,
                "days_ago": 3,
                "notes": [
                    "Discount code was valid but not applied due to checkout bug. Partial refund of $30 initiated.",
                ],
            },
            {
                "customer_name": "Nicole Chang",
                "customer_email": "nicole.chang@example.com",
                "subject": "Student discount verification",
                "description": "Submitted student ID for 20% education discount 5 days ago. Still pending verification. Need discount applied to recent purchase ORDER-3344 retroactively if approved.",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.LOW,
                "days_ago": 5,
                "notes": [
                    "Verification team reviewing documents. Usually 3-7 business days.",
                ],
            },
        ]

        for i, data in enumerate(tickets_data):
            notes = data.pop("notes", [])
            days_ago = data.pop("days_ago", 0)

            ticket = Ticket(
                ticket_id=f"TKT-{i+1:06d}",
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 23)),
                updated_at=datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 12)),
                **data,
            )
            db.add(ticket)
            db.flush()

            for note_text in notes:
                note = Note(
                    ticket_id=ticket.id,
                    note_text=note_text,
                    created_at=ticket.created_at + timedelta(hours=random.randint(1, 48)),
                )
                db.add(note)

        db.commit()
        print(f"Successfully seeded {len(tickets_data)} tickets with notes!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_database()