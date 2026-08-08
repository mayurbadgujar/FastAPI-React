from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Patient(BaseModel):
    fullname: str
    dob: datetime
    phone: str
    address: str
    sex: str
    remark: Optional[str] = None
    is_active: bool

class PatientCreate(Patient):
    createddate: datetime = datetime.now()   # required for create


class PatientUpdate(Patient):
    updatedate: datetime = datetime.now() 