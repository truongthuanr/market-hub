import asyncio
import json
from aiokafka import AIOKafkaProducer

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.outbox import fetch_pending_outbox, mark_outbox_published


class OutboxPublisher:
    def __init__(self):
        self._producer: AIOKafkaProducer | None = None
        self._task: asyncio.Task | None = None
        self._stopping = asyncio.Event()

    async def start(self):
        self._producer = AIOKafkaProducer(bootstrap_servers=settings.kafka_bootstrap_servers)
        await self._producer.start()
        self._task = asyncio.create_task(self._run())

    async def stop(self):
        self._stopping.set()
        if self._task:
            await self._task
        if self._producer:
            await self._producer.stop()

    async def _run(self):
        while not self._stopping.is_set():
            async with SessionLocal() as session:
                events = await fetch_pending_outbox(session)
                for event in events:
                    await self._publish_event(event)
                    await mark_outbox_published(session, event)
                await session.commit()
            try:
                await asyncio.wait_for(self._stopping.wait(), timeout=settings.outbox_poll_interval_seconds)
            except asyncio.TimeoutError:
                continue

    async def _publish_event(self, event):
        if not self._producer:
            return
        payload = json.dumps(event.payload).encode("utf-8")
        await self._producer.send_and_wait(event.topic, payload)
