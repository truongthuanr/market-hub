"""add role to user_credentials

Revision ID: 3b6c5f1f1f2b
Revises: None
Create Date: 2024-09-20 00:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "3b6c5f1f1f2b"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_credentials",
        sa.Column("role", sa.String(length=50), nullable=False, server_default="buyer"),
    )


def downgrade() -> None:
    op.drop_column("user_credentials", "role")
