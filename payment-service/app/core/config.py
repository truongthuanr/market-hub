from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        env_parse_delimiter=",",
    )

    app_name: str = "Payment Service"
    api_v1_prefix: str = "/v1"
    database_url: str = Field(
        default="mysql+asyncmy://payment_user:payment_pw@markethub-db:3306/payment_db",
        validation_alias=AliasChoices("PAYMENT_DATABASE_URL"),
    )
    kafka_bootstrap_servers: str = Field(
        default="kafka:9092",
        validation_alias=AliasChoices("KAFKA_BOOTSTRAP_SERVERS"),
    )
    provider_name: str = Field(default="payos", validation_alias=AliasChoices("PAYMENT_PROVIDER"))
    payos_webhook_secret: str = Field(
        default="change-me", validation_alias=AliasChoices("PAYOS_WEBHOOK_SECRET")
    )
    outbox_poll_interval_seconds: int = Field(
        default=5, validation_alias=AliasChoices("OUTBOX_POLL_INTERVAL_SECONDS")
    )


settings = Settings()
