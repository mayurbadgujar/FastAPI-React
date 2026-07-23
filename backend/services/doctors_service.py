from database.connection import database
from database.doctor import doctors
from datetime import datetime

async def create_doctor(doctor_data):
    query = doctors.select().where(((doctors.c.firstname == doctor_data.firstname) | (doctors.c.lastname == doctor_data.lastname)) & (doctors.c.phone == doctor_data.phone) & (doctors.c.is_active == True))
    existing_doctor = await database.fetch_one(query)

    if existing_doctor:
        return {"error": "Doctor with this name or phone number already exists"}

    query = doctors.insert().values(
        firstname=doctor_data.firstname,
        lastname=doctor_data.lastname,
        date_of_birth=datetime.strptime(doctor_data.date_of_birth, "%Y-%m-%d"),
        email=doctor_data.email,
        phone=doctor_data.phone,
        degree=doctor_data.degree,
        completion_date=datetime.strptime(doctor_data.completion_date, "%Y-%m-%d"),
        specialization=doctor_data.specialization,
        address=doctor_data.address,
        is_active=True
    )
    await database.execute(query)
    return {"message": "Doctor created successfully!"}

async def get_doctor_by_email_or_phone(email: str, phone: str):
    query = doctors.select().where((doctors.c.email == email) | (doctors.c.phone == phone))
    doctor = await database.fetch_one(query)
    return doctor

async def get_doctor_by_id(doctor_id: int):
    query = doctors.select().where(doctors.c.id == doctor_id)
    doctor = await database.fetch_one(query)
    return doctor

async def get_all_doctors():
    query = doctors.select().where(doctors.c.is_active == True)
    all_doctors = await database.fetch_all(query)
    return all_doctors

async def update_doctor(doctor_id: int, doctor_data):
    query = doctors.select().where(doctors.c.id == doctor_id)
    existing_doctor = await database.fetch_one(query)
    if not existing_doctor:
        return None

    query = doctors.update().where(doctors.c.id == doctor_id).values(
        firstname=doctor_data.firstname,
        lastname=doctor_data.lastname,
        date_of_birth=datetime.strptime(doctor_data.date_of_birth, "%Y-%m-%d"),
        email=doctor_data.email,
        phone=doctor_data.phone,
        degree=doctor_data.degree,
        completion_date=datetime.strptime(doctor_data.completion_date, "%Y-%m-%d"),
        specialization=doctor_data.specialization,
        address=doctor_data.address,
        is_active=doctor_data.is_active
    )
    await database.execute(query)
    return {"message": "Doctor updated successfully"}

async def delete_doctor(doctor_id: int):
    query = doctors.select().where(doctors.c.id == doctor_id)
    existing_doctor = await database.fetch_one(query)

    if not existing_doctor:
        return None

    query = doctors.update().where(doctors.c.id == doctor_id).values(is_active=False)
    await database.execute(query)
    return {"message": "Doctor deleted successfully"}