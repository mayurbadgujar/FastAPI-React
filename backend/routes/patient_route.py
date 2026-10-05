from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from core.roles import UserRole
from core.rbac import require_roles
from schemas.patient_schema import PatientCreate, PatientUpdate
from services.patient_service import (
    create_patient,
    delete_patient,
    update_patient,
    get_patient_byid,
    get_patient_phone_or_name,
    get_patients,
)

patient_router = APIRouter()

staff_roles = require_roles(UserRole.ADMIN, UserRole.DOCTOR)


@patient_router.post("/", status_code=201, summary="create patient")
async def create(data: PatientCreate, current_user=Depends(staff_roles)):
    return await create_patient(data)


@patient_router.get("/all", status_code=200, summary="get all patients")
async def getPatients(user=Depends(staff_roles)):
    return await get_patients()


@patient_router.get("/{id}", summary="get patient by id")
async def get_by_Id(id: int, user=Depends(staff_roles)):
    patient = await get_patient_byid(id)
    if patient:
        return patient
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient id not found")


@patient_router.get("/", summary="get patient by phone or name")
async def get_patient(
    phone: Optional[str] = None,
    name: Optional[str] = None,
    user=Depends(staff_roles),
):
    if not phone and not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide name or Phone Number",
        )

    data = await get_patient_phone_or_name(phone=phone, name=name)

    if data:
        return data

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Patient not found with the provided name or phone number",
    )


@patient_router.delete("/{id}", summary="delete patient")
async def delete(id: int, user=Depends(staff_roles)):
    data = await delete_patient(id)
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient id not found",
        )
    return data


@patient_router.put("/{id}", summary="update patient")
async def update(id: int, data: PatientUpdate, user=Depends(staff_roles)):
    return await update_patient(id, data)
