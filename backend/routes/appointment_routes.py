from fastapi import APIRouter, Depends, status

from core.rbac import require_roles
from core.roles import UserRole
from schemas.appointment_schema import AppointmentCreate, AppointmentStatusUpdate
from services.appointment_service import (
    cancel_appointment,
    create_appointment,
    get_appointments,
    update_appointment_status,
)

appointment_router = APIRouter()

all_roles = require_roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
patient_role = require_roles(UserRole.PATIENT)
staff_roles = require_roles(UserRole.ADMIN, UserRole.DOCTOR)


@appointment_router.get("/", summary="List appointments for the current user")
async def list_appointments(current_user=Depends(all_roles)):
    return await get_appointments(current_user)


@appointment_router.post("/", status_code=status.HTTP_201_CREATED, summary="Book an appointment")
async def book_appointment(
    data: AppointmentCreate,
    current_user=Depends(patient_role),
):
    return await create_appointment(current_user, data)


@appointment_router.post("/{appointment_id}/cancel", summary="Cancel an appointment")
async def cancel(
    appointment_id: int,
    current_user=Depends(all_roles),
):
    return await cancel_appointment(appointment_id, current_user)


@appointment_router.patch("/{appointment_id}", summary="Update appointment status")
async def update_status(
    appointment_id: int,
    data: AppointmentStatusUpdate,
    current_user=Depends(staff_roles),
):
    return await update_appointment_status(appointment_id, data.status, current_user)
