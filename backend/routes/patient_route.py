from typing import Optional

from fastapi import APIRouter, HTTPException,status,Depends
from services.auth_service import get_current_user
from schemas.patient_schema import PatientCreate, PatientUpdate
from services.patient_service import create_patient, delete_patient, update_patient, get_patient_byid,get_patient_phone_or_name, get_patients

patient_router =APIRouter()

@patient_router.post("/",status_code=201, summary="create patient")
async def create(data: PatientCreate, current_user=Depends(get_current_user)):
    return await create_patient(data)

@patient_router.get("/all", status_code=200, summary="get all patients")
async def getPatients(user=Depends(get_current_user)):
    return await get_patients()

@patient_router.get("/{id}", summary="get patient by id")
async def get_by_Id(id:int, user=Depends(get_current_user)):
    patient = await get_patient_byid(id)
    if patient:
        return patient
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient id not found")

@patient_router.get("/", summary="get patient by phone or name")
async def get_patient(phone: Optional[str] =None,
                      name:Optional[str]=None,
                      user=Depends(get_current_user)):
    if not phone and not name:
        raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST,detail="Please provide name or Phone Number")

    data= await get_patient_phone_or_name(phone=phone,name=name)

    if data:
        return data

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found with the provided name or phone number") 


@patient_router.delete("/{id}",summary="delete patient")
async def delete(id:int, user=Depends(get_current_user)):
    data= delete_patient(id)
    if data:
        return status.HTTP_200_OK
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail= "Patient id not found")

@patient_router.put("/{id}", summary="update patient")
async def update(id:int, data: PatientUpdate, user=Depends(get_current_user)):
    await update_patient(id,data)
    return status.HTTP_204_NO_CONTENT