from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"

    @classmethod
    def values(cls) -> set[str]:
        return {member.value for member in cls}
