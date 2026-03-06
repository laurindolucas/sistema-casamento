"""Camada de acesso ao banco: cria cursor transacional com commit/rollback."""

from contextlib import contextmanager

import psycopg2
from psycopg2.extras import RealDictCursor

from app.config import DATABASE_URL


@contextmanager
def db_cursor(commit=False):
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
