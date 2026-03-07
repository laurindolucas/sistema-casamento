"""Inicializacao e evolucao basica do schema no banco de dados."""

from app.db import db_cursor


def ensure_schema():
    statements = [
        """
        CREATE TABLE IF NOT EXISTS lista_presentes (
            id BIGSERIAL PRIMARY KEY,
            nome_presente TEXT NOT NULL,
            descricao TEXT NOT NULL DEFAULT '',
            valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
            categoria TEXT NOT NULL DEFAULT 'geral',
            tipo_pagamento TEXT NOT NULL DEFAULT 'pix',
            url_image TEXT,
            quantidade_total INTEGER NOT NULL DEFAULT 1 CHECK (quantidade_total >= 1),
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """,
        "ALTER TABLE lista_presentes ADD COLUMN IF NOT EXISTS quantidade_total INTEGER NOT NULL DEFAULT 1;",
        "ALTER TABLE lista_presentes ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;",
        "ALTER TABLE lista_presentes ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();",
        """
        CREATE TABLE IF NOT EXISTS reservas_presentes (
            id BIGSERIAL PRIMARY KEY,
            presente_id BIGINT NOT NULL REFERENCES lista_presentes(id) ON DELETE CASCADE,
            nome_convidado TEXT NOT NULL,
            email_convidado TEXT,
            telefone_convidado TEXT,
            mensagem TEXT,
            status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada')),
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            cancelado_em TIMESTAMPTZ
        );
        """,
        """
        CREATE UNIQUE INDEX IF NOT EXISTS reservas_presentes_unica_ativa
            ON reservas_presentes (presente_id)
            WHERE status = 'ativa';
        """,
    ]

    with db_cursor(commit=True) as cur:
        for stmt in statements:
            cur.execute(stmt)
