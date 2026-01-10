from pydantic import Field, AliasChoices, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        env_parse_delimiter=",",
    )

    app_name: str = "Commerce Service"
    api_v1_prefix: str = "/v1"
    database_url: str = Field(
        default="mysql+asyncmy://commerce_user:commerce_pw@markethub-db:3306/commerce_db",
        validation_alias=AliasChoices("COMMERCE_DATABASE_URL"),
    )
    redis_url: str | None = Field(default="redis://redis:6379/0", alias="REDIS_URL")
    kafka_bootstrap_servers: str | None = Field(default="kafka:9092", alias="KAFKA_BOOTSTRAP_SERVERS")
    secret_key: str = Field(default="change-me-in-prod", alias="SECRET_KEY")
    session_cookie_name: str = Field(default="markethub_session", alias="SESSION_COOKIE_NAME")
    session_cookie_same_site: str = Field(default="lax", alias="SESSION_COOKIE_SAMESITE")
    cors_origins: list[str] | str = Field(
        default_factory=lambda: ["http://localhost:3000"], alias="CORS_ORIGINS"
    )
    default_currency: str = Field(default="VND", alias="DEFAULT_CURRENCY")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
