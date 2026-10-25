from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import and_, func, select

from core.roles import UserRole
from database.appointment import appointments
from database.connection import database
from database.doctor import doctors
from database.user import users
from schemas.appointment_schema import AppointmentStatus


def _to_utc_naive(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def _format_appointment(row) -> dict:
    result = dict(row)
    scheduled_at = result["scheduled_at"]
    result["scheduled_at"] = scheduled_at.replace(tzinfo=timezone.utc).isoformat()
    return result


def _appointment_query():
    return (
        select(
            appointments.c.id,
            appointments.c.patient_user_id,
            appointments.c.doctor_id,
            appointments.c.scheduled_at,
            appointments.c.reason,
            appointments.c.status,
            appointments.c.created_at,
            users.c.username.label("patient_name"),
            doctors.c.firstname.label("doctor_firstname"),
            doctors.c.lastname.label("doctor_lastname"),
            doctors.c.specialization.label("specialization"),
        )
        .select_from(
            appointments.join(users, appointments.c.patient_user_id == users.c.id).join(
                doctors, appointments.c.doctor_id == doctors.c.id
            )
        )
    )


async def get_appointments(current_user):
    query = _appointment_query().order_by(appointments.c.scheduled_at.desc())
    if current_user.role == UserRole.PATIENT:
        query = query.where(appointments.c.patient_user_id == current_user.id)
    elif current_user.role == UserRole.DOCTOR:
        doctor_id = await _get_doctor_id_for_user(current_user)
        if doctor_id is None:
            return []
        query = query.where(appointments.c.doctor_id == doctor_id)
    return [_format_appointment(row) for row in await database.fetch_all(query)]


async def _get_doctor_id_for_user(current_user):
    doctor = await database.fetch_one(
        select(doctors.c.id).where(
            func.lower(doctors.c.email) == current_user.email.lower()
        )
    )
    return doctor["id"] if doctor else None


async def _ensure_appointment_access(appointment, current_user):
    if current_user.role == UserRole.ADMIN:
        return
    if current_user.role == UserRole.PATIENT:
        has_access = appointment["patient_user_id"] == current_user.id
    elif current_user.role == UserRole.DOCTOR:
        doctor_id = await _get_doctor_id_for_user(current_user)
        has_access = doctor_id is not None and appointment["doctor_id"] == doctor_id
    else:
        has_access = False

    if not has_access:
        raise HTTPException(status_code=403, detail="You cannot access this appointment")


async def create_appointment(current_user, appointment_data):
    scheduled_at = _to_utc_naive(appointment_data.scheduled_at)
    if (
        scheduled_at.minute % 15 != 0
        or scheduled_at.second != 0
        or scheduled_at.microsecond != 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment time must use 15-minute intervals",
        )
    if scheduled_at <= datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment time must be in the future",
        )

    doctor = await database.fetch_one(
        doctors.select().where(
            and_(doctors.c.id == appointment_data.doctor_id, doctors.c.is_active == True)
        )
    )
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found or is inactive",
        )

    existing = await database.fetch_one(
        appointments.select().where(
            and_(
                appointments.c.doctor_id == appointment_data.doctor_id,
                appointments.c.scheduled_at == scheduled_at,
                appointments.c.status != AppointmentStatus.CANCELLED.value,
            )
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This doctor already has an appointment at that time",
        )

    appointment_id = await database.execute(
        appointments.insert().values(
            patient_user_id=current_user.id,
            doctor_id=appointment_data.doctor_id,
            scheduled_at=scheduled_at,
            reason=appointment_data.reason,
            status=AppointmentStatus.PENDING.value,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
    )
    row = await database.fetch_one(
        _appointment_query().where(appointments.c.id == appointment_id)
    )
    return _format_appointment(row)


async def cancel_appointment(appointment_id: int, current_user):
    appointment = await database.fetch_one(
        appointments.select().where(appointments.c.id == appointment_id)
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await _ensure_appointment_access(appointment, current_user)
    if appointment["status"] in {
        AppointmentStatus.CANCELLED.value,
        AppointmentStatus.COMPLETED.value,
    }:
        raise HTTPException(
            status_code=400,
            detail="Cancelled or completed appointments cannot be changed",
        )

    await database.execute(
        appointments.update()
        .where(appointments.c.id == appointment_id)
        .values(status=AppointmentStatus.CANCELLED.value)
    )
    return {"message": "Appointment cancelled"}


async def update_appointment_status(
    appointment_id: int,
    new_status: AppointmentStatus,
    current_user,
):
    appointment = await database.fetch_one(
        appointments.select().where(appointments.c.id == appointment_id)
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    await _ensure_appointment_access(appointment, current_user)
    if appointment["status"] in {
        AppointmentStatus.CANCELLED.value,
        AppointmentStatus.COMPLETED.value,
    }:
        raise HTTPException(
            status_code=400,
            detail="Cancelled or completed appointments cannot be changed",
        )
    allowed_next_statuses = {
        AppointmentStatus.PENDING.value: {
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.DECLINED,
        },
        AppointmentStatus.CONFIRMED.value: {AppointmentStatus.COMPLETED},
    }.get(appointment["status"], set())
    if new_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=400,
            detail="Appointment status transition is not allowed",
        )

    await database.execute(
        appointments.update()
        .where(appointments.c.id == appointment_id)
        .values(status=new_status.value)
    )
    return {"message": "Appointment status updated"}
