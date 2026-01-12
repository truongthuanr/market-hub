from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import OutboxEvent


async def create_outbox_event(session: AsyncSession, topic: str, payload: dict) -> OutboxEvent:
    event = OutboxEvent(topic=topic, payload=payload, status="pending")
    session.add(event)
    await session.flush()
    return event


async def fetch_pending_outbox(session: AsyncSession, limit: int = 50):
    stmt = select(OutboxEvent).where(OutboxEvent.status == "pending").limit(limit)
    result = await session.execute(stmt)
    return list(result.scalars())


async def mark_outbox_published(session: AsyncSession, event: OutboxEvent):
    event.status = "published"
    event.published_at = datetime.utcnow()
    await session.flush()
