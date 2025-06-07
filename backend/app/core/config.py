from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    DATABASE_NAME: str = "human_rights_mis"
    SECRET_KEY: str = "your-secret-key" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()