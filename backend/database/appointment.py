from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text

from database.connection import metadata

appointments = Table(
    "appointments",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("patient_user_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("doctor_id", Integer, ForeignKey("doctors.id"), nullable=False),
    Column("scheduled_at", DateTime, nullable=False),
    Column("reason", Text, nullable=True),
    Column("status", String(20), nullable=False, default="pending"),
    Column("created_at", DateTime, nullable=False),
)
