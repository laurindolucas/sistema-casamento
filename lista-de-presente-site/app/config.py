"""Centraliza leitura de variaveis de ambiente e configuracoes globais."""

import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
AUTO_MIGRATE = os.getenv("AUTO_MIGRATE", "true").lower() == "true"
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL nao configurada no .env")
