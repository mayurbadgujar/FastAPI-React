from database.connection import database
from database.patient import patient
from datetime import datetime
from sqlalchemy import and_, or_

async def create_patient(patient_data):
    print(patient_data)
    query =patient.select().where(  and_(
            patient.c.phone == patient_data.phone,
            patient.c.is_active == True
        ))
    existing_patient = await database.fetch_one(query)

    if existing_patient:
        return {"error":"Patient phone number is already exists"}

    query =patient.insert().values(
        fullname=patient_data.fullname,
        dob=patient_data.dob,
        address=patient_data.address,
        sex=patient_data.sex,
        phone=patient_data.phone,
        createddate=datetime.now(),
        is_active=True 
    )
    await database.execute(query)
    return {"message":"patient created successfully!"}

async def get_patients():
    query = patient.select().where(patient.c.is_active==True)
    return await database.fetch_all(query)

async def get_patient_byid(id:int):
    query = patient.select().where(patient.c.id==id)
    return await database.fetch_one(query)

async def get_patient_phone_or_name(phone:str,name:str):
    query= patient.select().where(or_(patient.c.phone==phone, patient.c.fullname.like(f"%{name}%")))
    return await database.fetch_all(query)

async def update_patient(id:int ,patient_data):
    query= patient.select().where(patient.c.id==id)
    existing_data = await database.fetch_one(query)
    if not existing_data:
        return None

    query =patient.update().where(patient.c.id==id).values(
        fullname=patient_data.fullname,
        address = patient_data.address,
        dob=patient_data.dob,
        remark=patient_data.remark,
        phone=patient_data.phone,
        updateddate= datetime.now(),
        sex=patient_data.sex,
        isactive=patient_data.is_active
    )
    await database.execute(query)
    return {"message":"Patient details updated!"}

async def delete_patient(id:int):
    query = patient.update().where(patient.c.id==id)
    if query is None:
        return {"error":"not found"}
    await database.execute(query)
    return {"message":"Patient deleted!"}
