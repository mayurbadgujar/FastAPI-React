from sqlalchemy import Table, Column, Integer, String , Boolean, DateTime
from database.connection import metadata

patient =Table("patient", metadata,
               Column("id", Integer, primary_key=True),
               Column("fullname", String, nullable=False),
                Column('dob',DateTime,nullable=False),
                Column("phone", String(10), nullable=False, unique=True),
                Column("sex", String, nullable=True),
                Column('address', String, nullable=False),
                Column('remark', String, nullable=True),
                Column('createddate',DateTime, nullable=True),
                Column('updateddate',DateTime, nullable= True),
                Column('is_active', Boolean, default=True, nullable= True)                            
               )