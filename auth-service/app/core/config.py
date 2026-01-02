from pydantic_settings import BaseSettings
from pydantic import Field, AliasChoices


class Settings(BaseSettings):
    database_url: str = Field(
        default="mysql+pymysql://user:password@auth-db:3306/auth_db",
        validation_alias=AliasChoices("DATABASE_URL", "AUTH_DATABASE_URL"),
    )
    secret_key: str = Field(default="change-me-in-prod", alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expires_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRES_MINUTES")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
