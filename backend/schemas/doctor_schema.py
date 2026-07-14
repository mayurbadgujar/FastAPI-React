from pydantic import BaseModel  

class DoctorCreate(BaseModel):
    firstname: str
    lastname: str
    date_of_birth: str
    email: str
    phone: int
    degree: str
    specialization: str
    address: str
    completion_date: str

class DoctorUpdate(BaseModel):
    firstname: str
    lastname: str
    date_of_birth: str
    email: str
    phone: int
    degree: str
    specialization: str
    address: str
    completion_date: str
    is_active: bool