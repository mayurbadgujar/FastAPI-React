import asyncio
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from core.roles import UserRole
from schemas.appointment_schema import AppointmentStatus
from services import appointment_service


class AppointmentDatabase:
    def __init__(self, doctor=None, appointment=None):
        self.doctor = doctor
        self.appointment = appointment
        self.list_query = None
        self.status_query = None

    async def fetch_one(self, query):
        if "doctors" in str(query):
            return self.doctor
        return self.appointment

    async def fetch_all(self, query):
        self.list_query = query
        return []

    async def execute(self, query):
        self.status_query = query


def test_patient_appointment_list_is_scoped_to_patient(monkeypatch):
    database = AppointmentDatabase()
    monkeypatch.setattr(appointment_service, "database", database)
    patient = SimpleNamespace(id=23, email="patient@example.com", role=UserRole.PATIENT)

    asyncio.run(appointment_service.get_appointments(patient))

    query = str(database.list_query)
    assert "appointments.patient_user_id" in query
    assert database.list_query.compile().params["patient_user_id_1"] == 23


def test_doctor_appointment_list_is_scoped_to_matched_doctor(monkeypatch):
    database = AppointmentDatabase(doctor={"id": 8})
    monkeypatch.setattr(appointment_service, "database", database)
    doctor = SimpleNamespace(id=23, email="doctor@example.com", role=UserRole.DOCTOR)

    asyncio.run(appointment_service.get_appointments(doctor))

    query = str(database.list_query)
    assert "appointments.doctor_id" in query
    assert database.list_query.compile().params["doctor_id_1"] == 8


def test_doctor_cannot_update_another_doctors_appointment(monkeypatch):
    database = AppointmentDatabase(
        doctor={"id": 8},
        appointment={"id": 12, "doctor_id": 9, "status": "pending"},
    )
    monkeypatch.setattr(appointment_service, "database", database)
    doctor = SimpleNamespace(id=23, email="doctor@example.com", role=UserRole.DOCTOR)

    with pytest.raises(HTTPException) as error:
        asyncio.run(
            appointment_service.update_appointment_status(
                12,
                AppointmentStatus.CONFIRMED,
                doctor,
            )
        )

    assert error.value.status_code == 403
    assert database.status_query is None


def test_admin_can_list_all_appointments(monkeypatch):
    database = AppointmentDatabase()
    monkeypatch.setattr(appointment_service, "database", database)
    admin = SimpleNamespace(id=1, email="admin@example.com", role=UserRole.ADMIN)

    asyncio.run(appointment_service.get_appointments(admin))

    query = str(database.list_query)
    assert "WHERE" not in query
