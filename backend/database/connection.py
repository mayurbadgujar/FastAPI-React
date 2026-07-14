from databases import Database
from sqlalchemy import create_engine, MetaData
from core.config import settings

database = Database(settings.DATABASE_URL)
metadata = MetaData()
engine = create_engine(settings.DATABASE_URL)
