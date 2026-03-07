"""Servicos de dominio para CRUD e listagem de presentes."""

from decimal import Decimal

from app.db import db_cursor


def list_presentes(page, limit, categoria=None, busca=None, somente_disponiveis=False):
    offset = (page - 1) * limit

    filters = ["p.ativo = TRUE"]
    params = []

    if categoria:
        filters.append("LOWER(p.categoria) = LOWER(%s)")
        params.append(categoria)

    if busca:
        filters.append("(p.nome_presente ILIKE %s OR p.descricao ILIKE %s)")
        term = f"%{busca}%"
        params.extend([term, term])

    where_clause = " AND ".join(filters)
    if somente_disponiveis:
        where_clause += " AND r_ativa.id IS NULL"

    sql = f"""
        SELECT
            p.id,
            p.nome_presente,
            p.descricao,
            p.valor::float AS valor,
            p.categoria,
            p.tipo_pagamento,
            p.url_image,
            p.quantidade_total,
            p.ativo,
            p.criado_em,
            p.atualizado_em,
            (r_ativa.id IS NULL) AS disponivel,
            r_ativa.nome_convidado AS reservado_por
        FROM lista_presentes p
        LEFT JOIN reservas_presentes r_ativa
            ON r_ativa.presente_id = p.id AND r_ativa.status = 'ativa'
        WHERE {where_clause}
        ORDER BY p.criado_em DESC
        LIMIT %s OFFSET %s;
    """

    params.extend([limit, offset])

    with db_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def get_presente(presente_id):
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT
                p.id,
                p.nome_presente,
                p.descricao,
                p.valor::float AS valor,
                p.categoria,
                p.tipo_pagamento,
                p.url_image,
                p.quantidade_total,
                p.ativo,
                p.criado_em,
                p.atualizado_em,
                (r_ativa.id IS NULL) AS disponivel,
                r_ativa.id AS reserva_id,
                r_ativa.nome_convidado AS reservado_por,
                r_ativa.email_convidado,
                r_ativa.telefone_convidado,
                r_ativa.mensagem,
                r_ativa.criado_em AS reservado_em
            FROM lista_presentes p
            LEFT JOIN reservas_presentes r_ativa
              ON r_ativa.presente_id = p.id AND r_ativa.status = 'ativa'
            WHERE p.id = %s AND p.ativo = TRUE;
            """,
            (presente_id,),
        )
        return cur.fetchone()


def create_presente(payload):
    with db_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO lista_presentes
                (nome_presente, descricao, valor, categoria, tipo_pagamento, url_image, quantidade_total, ativo)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (
                payload["nome_presente"].strip(),
                payload["descricao"].strip(),
                Decimal(str(payload["valor"])),
                payload["categoria"].strip(),
                payload["tipo_pagamento"].strip(),
                payload.get("url_image"),
                int(payload.get("quantidade_total", 1)),
                bool(payload.get("ativo", True)),
            ),
        )
        return cur.fetchone()


def update_presente(presente_id, payload):
    allowed_fields = {
        "nome_presente": "nome_presente",
        "descricao": "descricao",
        "valor": "valor",
        "categoria": "categoria",
        "tipo_pagamento": "tipo_pagamento",
        "url_image": "url_image",
        "quantidade_total": "quantidade_total",
        "ativo": "ativo",
    }

    updates = []
    values = []

    for key, db_col in allowed_fields.items():
        if key in payload:
            updates.append(f"{db_col} = %s")
            if key == "valor":
                values.append(Decimal(str(payload[key])))
            elif key == "quantidade_total":
                values.append(int(payload[key]))
            elif key in {"nome_presente", "descricao", "categoria", "tipo_pagamento"}:
                values.append(str(payload[key]).strip())
            else:
                values.append(payload[key])

    if not updates:
        return None, "Nenhum campo valido para atualizar"

    updates.append("atualizado_em = NOW()")
    values.append(presente_id)

    with db_cursor(commit=True) as cur:
        cur.execute(
            f"""
            UPDATE lista_presentes
            SET {", ".join(updates)}
            WHERE id = %s
            RETURNING id;
            """,
            values,
        )
        row = cur.fetchone()

    return row, None


def delete_presente(presente_id):
    with db_cursor(commit=True) as cur:
        cur.execute("DELETE FROM lista_presentes WHERE id = %s RETURNING id;", (presente_id,))
        return cur.fetchone()


def list_presentes_for_web():
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT
                p.id,
                p.nome_presente,
                p.descricao,
                p.valor::float AS valor,
                p.categoria,
                p.tipo_pagamento,
                p.url_image
            FROM lista_presentes p
            WHERE p.ativo = TRUE
            ORDER BY p.criado_em DESC;
            """
        )
        return cur.fetchall()
