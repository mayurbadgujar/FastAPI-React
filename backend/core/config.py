from decouple import config

class Settings:
    DATABASE_URL = config("DATABASE_URL")
    SECRET_KEY = config("SECRET_KEY")
    ALGORITHM = config("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES = config("ACCESS_TOKEN_EXPIRE_MINUTES", cast=int)

settings = Settings()