from pydantic import BaseModel


class PromoValidateIn(BaseModel):
    code: str


class PromoValidateOut(BaseModel):
    valid: bool
    reason: str | None = None
