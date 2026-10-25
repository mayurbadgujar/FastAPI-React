from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class AppointmentCreate(BaseModel):
    doctor_id: int
    scheduled_at: datetime
    reason: str | None = Field(default=None, max_length=1000)


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus
