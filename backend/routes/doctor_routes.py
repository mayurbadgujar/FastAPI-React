from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from schemas.doctor_schema import DoctorCreate, DoctorUpdate
from services.doctors_service import create_doctor, get_doctor_by_email_or_phone, get_all_doctors, update_doctor, delete_doctor, get_doctor_by_id
from services.auth_service import get_current_user

doctors_router = APIRouter()

@doctors_router.post("/create", status_code=201, summary="Create a new doctor")
async def create(doctor_data: DoctorCreate, current_user=Depends(get_current_user)):
    return await create_doctor(doctor_data)

@doctors_router.get("/all", summary="Get all doctors")
async def get_all(current_user=Depends(get_current_user)):
    doctors = await get_all_doctors()
    if doctors is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No doctors found"
        )
    return doctors

@doctors_router.get("/{doctor_id}", summary="Get doctor by ID")
async def get_by_id(doctor_id: int, current_user=Depends(get_current_user)):
    doctor = await get_doctor_by_id(doctor_id)
    if doctor:
        return doctor
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Doctor id not found"
    )

@doctors_router.get("/", summary="Get doctor by email or phone")
async def get_doctor(
    email: Optional[str] = None,
    phone: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    if not email and not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must provide either an email or a phone number."
        )

    doctor = await get_doctor_by_email_or_phone(email=email, phone=phone)

    if doctor:
        return doctor

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Doctor not found with the provided email or phone number"
    )

@doctors_router.put("/{doctor_id}", summary="Update doctor information")
async def update(doctor_id: int, doctor_data: DoctorUpdate, current_user=Depends(get_current_user)):
    updated_doctor = await update_doctor(doctor_id, doctor_data)
    if updated_doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor id not found"
        )
    return updated_doctor

@doctors_router.delete("/{doctor_id}", summary="Delete a doctor")
async def delete(doctor_id: int, current_user=Depends(get_current_user)):
    deleted_doctor = await delete_doctor(doctor_id)
    if deleted_doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor id not found"
        )
    return deleted_doctor