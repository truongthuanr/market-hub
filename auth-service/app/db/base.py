from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so Alembic and metadata have them
from app.db.models import user_credential  # noqa: F401,E402
