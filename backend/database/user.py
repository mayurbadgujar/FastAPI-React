from sqlalchemy import Table, Column, Integer, String, Boolean
from database.connection import metadata

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String, unique=True),
    Column("email", String, unique=True),
    Column("password_hash", String),
    Column("is_active", Boolean, default=True)
)
