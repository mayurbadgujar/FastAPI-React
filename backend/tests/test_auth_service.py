import asyncio

from core.roles import UserRole
from services.auth_service import register_user


def test_register_user_first_user_is_admin(monkeypatch):
    captured = {}

    class DummyDatabase:
        async def fetch_one(self, query):
            return None

        async def fetch_val(self, query):
            captured["count_query"] = query
            return 0

        async def execute(self, query):
            captured["insert_query"] = query

    monkeypatch.setattr("services.auth_service.database", DummyDatabase())

    result = asyncio.run(register_user("alice", "alice@example.com", "secret123"))

    assert result.message == "User registered successfully"
    assert result.role == UserRole.ADMIN
    assert "count" in str(captured["count_query"]).lower()
