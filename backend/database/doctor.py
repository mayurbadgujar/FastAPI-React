from sqlalchemy import Table, Column, Integer, String, Boolean, DateTime
from database.connection import metadata

doctors = Table(
    "doctors",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("firstname", String, nullable=False),
    Column("lastname", String, nullable=False),
    Column("date_of_birth", DateTime, nullable=False),
    Column("email", String(100), nullable=False, unique=True),
    Column("phone", String(10), nullable=False, unique=True),
    Column("degree", String(100), nullable=False),
    Column("completion_date", DateTime, nullable=False),
    Column("specialization", String(100), nullable=False),
    Column("address", String(500), nullable=False),
    Column("is_active", Boolean, default=True)
)