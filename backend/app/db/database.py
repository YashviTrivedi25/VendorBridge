"""
Async SQLAlchemy engine + session factory.
DATABASE_URL must be set in .env, e.g.:
  postgresql+asyncpg://user:password@host:5432/dbname
"""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:  # type: ignore[return]
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables() -> None:
    """Create all tables by strictly executing SQL.txt."""
    import os
    import re
    from sqlalchemy import text

    # Locate SQL.txt in the root of the project
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    )
    sql_path = os.path.join(base_dir, "SQL.txt")

    try:
        with open(sql_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract SQL between ```sql and ```
        match = re.search(r"```sql(.*?)```", content, re.DOTALL)
        if match:
            sql_script = match.group(1).strip()
        else:
            sql_script = content

        async with engine.begin() as conn:
            # We execute the script directly
            await conn.execute(text(sql_script))
            print("Successfully executed SQL.txt schema.")
    except Exception as e:
        print(f"Failed to execute SQL.txt: {e}")
