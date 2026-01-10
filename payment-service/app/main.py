from starlette.applications import Starlette

from app.api.routes import router
from app.db.base import Base
from app.db.session import engine
from app.kafka.publisher import OutboxPublisher

app = Starlette(routes=router.routes)

publisher = OutboxPublisher()


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await publisher.start()


@app.on_event("shutdown")
async def on_shutdown():
    await publisher.stop()
