"""Servicos relacionados as confirmacoes de presenca."""

from app.db import db_cursor


def list_confirmacoes(page, limit, confirmado=None, busca=None):
    offset = (page - 1) * limit

    filters = []
    params = []

    if confirmado is not None:
        filters.append("c.confirmado = %s")
        params.append(confirmado)

    if busca:
        filters.append("c.nome_convidado ILIKE %s")
        params.append(f"%{busca}%")

    where_clause = ""
    if filters:
        where_clause = "WHERE " + " AND ".join(filters)

    sql = f"""
        SELECT
            c.id,
            c.nome_convidado,
            c.confirmado,
            c.criado_em
        FROM confirmacoes c
        {where_clause}
        ORDER BY c.criado_em DESC
        LIMIT %s OFFSET %s;
    """

    params.extend([limit, offset])

    with db_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def get_confirmacao(confirmacao_id):
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT
                c.id,
                c.nome_convidado,
                c.confirmado,
                c.criado_em
            FROM confirmacoes c
            WHERE c.id = %s;
            """,
            (confirmacao_id,),
        )
        return cur.fetchone()


def create_confirmacao(nome_convidado, confirmado=False):
    with db_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO confirmacoes (nome_convidado, confirmado)
            VALUES (%s, %s)
            RETURNING id, nome_convidado, confirmado, criado_em;
            """,
            (nome_convidado, confirmado),
        )
        return cur.fetchone()


def update_confirmacao(confirmacao_id, nome_convidado=None, confirmado=None):
    updates = []
    params = []

    if nome_convidado is not None:
        updates.append("nome_convidado = %s")
        params.append(nome_convidado)

    if confirmado is not None:
        updates.append("confirmado = %s")
        params.append(confirmado)

    if not updates:
        return None

    params.append(confirmacao_id)

    with db_cursor(commit=True) as cur:
        cur.execute(
            f"""
            UPDATE confirmacoes
            SET {", ".join(updates)}
            WHERE id = %s
            RETURNING id, nome_convidado, confirmado, criado_em;
            """,
            params,
        )
        return cur.fetchone()
