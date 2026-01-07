from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices, field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        env_parse_delimiter=",",
    )
    database_url: str = Field(
        default="mysql+pymysql://user:password@auth-db:3306/auth_db",
        validation_alias=AliasChoices("AUTH_DATABASE_URL"),
    )
    secret_key: str = Field(default="change-me-in-prod", alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expires_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRES_MINUTES")
    cors_origins: list[str] | str = Field(
        default_factory=lambda: ["http://localhost:3000"], alias="CORS_ORIGINS"
    )
    session_cookie_name: str = Field(default="markethub_session", alias="SESSION_COOKIE_NAME")
    session_cookie_same_site: str = Field(default="lax", alias="SESSION_COOKIE_SAMESITE")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

settings = Settings()
