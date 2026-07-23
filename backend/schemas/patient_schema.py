from datetime import datetime

from pydantic import BaseModel

class Patient(BaseModel):
    fullname:str
    dob:datetime
    phone:str
    address:str 
    sex:str
    remark:str

class PatientCreate(Patient):
    createddate: datetime = datetime.now()   # required for create


class PatientUpdate(Patient):
    updatedate: datetime = datetime.now() 