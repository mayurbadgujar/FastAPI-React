from sqlalchemy import inspect, text

from database.connection import engine


def ensure_user_role_column() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    if "role" in columns:
        return

    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'patient'")
        )
