"""Servicos de dominio para reservar e cancelar reservas de presentes."""

from app.db import db_cursor


def reservar_presente(presente_id, nome_convidado, email_convidado, telefone_convidado, mensagem):
    with db_cursor(commit=True) as cur:
        cur.execute("SELECT id, ativo FROM lista_presentes WHERE id = %s;", (presente_id,))
        presente = cur.fetchone()

        if not presente or not presente["ativo"]:
            return None, "Presente nao encontrado", 404

        cur.execute(
            """
            SELECT id FROM reservas_presentes
            WHERE presente_id = %s AND status = 'ativa';
            """,
            (presente_id,),
        )
        reserva_ativa = cur.fetchone()

        if reserva_ativa:
            return None, "Este presente ja foi reservado", 409

        cur.execute(
            """
            INSERT INTO reservas_presentes
                (presente_id, nome_convidado, email_convidado, telefone_convidado, mensagem, status)
            VALUES
                (%s, %s, %s, %s, %s, 'ativa')
            RETURNING id, criado_em;
            """,
            (presente_id, nome_convidado, email_convidado, telefone_convidado, mensagem),
        )
        reserva = cur.fetchone()

    return reserva, None, None


def cancelar_reserva(presente_id, reserva_id=None):
    with db_cursor(commit=True) as cur:
        if reserva_id:
            cur.execute(
                """
                UPDATE reservas_presentes
                SET status = 'cancelada', cancelado_em = NOW()
                WHERE id = %s AND presente_id = %s AND status = 'ativa'
                RETURNING id;
                """,
                (reserva_id, presente_id),
            )
        else:
            cur.execute(
                """
                UPDATE reservas_presentes
                SET status = 'cancelada', cancelado_em = NOW()
                WHERE presente_id = %s AND status = 'ativa'
                RETURNING id;
                """,
                (presente_id,),
            )

        return cur.fetchone()
