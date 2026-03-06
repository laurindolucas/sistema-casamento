"""Rotas REST da API para saber se a api tá funcionando, presentes e reservas."""

from flask import Blueprint, request

from app.schemas import validate_presente_payload
from app.services.presentes_service import (
    create_presente,
    delete_presente,
    get_presente,
    list_presentes,
    update_presente,
)
from app.services.reservas_service import cancelar_reserva, reservar_presente
from app.utils import api_response, json_default, parse_bool, parse_int, serialize_row

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/health", methods=["GET"])
def health():
    return api_response({"ok": True, "service": "lista-de-presentes-api"})


@api_bp.route("/presentes", methods=["GET"])
def listar_presentes_api():
    page = parse_int(request.args.get("page"), default=1, min_value=1)
    limit = parse_int(request.args.get("limit"), default=12, min_value=1, max_value=100)

    categoria = request.args.get("categoria")
    busca = request.args.get("busca")
    somente_disponiveis = parse_bool(request.args.get("somente_disponiveis"), default=False)

    rows = list_presentes(
        page=page,
        limit=limit,
        categoria=categoria,
        busca=busca,
        somente_disponiveis=somente_disponiveis,
    )
    presentes = [serialize_row(row) for row in rows]

    return api_response({
        "data": presentes,
        "page": page,
        "limit": limit,
        "count": len(presentes),
    })


@api_bp.route("/presentes/<int:presente_id>", methods=["GET"])
def detalhe_presente(presente_id):
    row = get_presente(presente_id)
    if not row:
        return api_response({"error": "Presente nao encontrado"}, status=404)
    return api_response({"data": serialize_row(row)})


@api_bp.route("/presentes", methods=["POST"])
def criar_presente():
    payload = request.get_json(silent=True)
    ok, error = validate_presente_payload(payload, partial=False)
    if not ok:
        return api_response({"error": error}, status=400)

    created = create_presente(payload)
    return api_response({"message": "Presente criado", "id": created["id"]}, status=201)


@api_bp.route("/presentes/<int:presente_id>", methods=["PATCH"])
def atualizar_presente(presente_id):
    payload = request.get_json(silent=True)
    ok, error = validate_presente_payload(payload, partial=True)
    if not ok:
        return api_response({"error": error}, status=400)

    if not payload:
        return api_response({"error": "Nenhum campo para atualizar"}, status=400)

    row, update_error = update_presente(presente_id, payload)
    if update_error:
        return api_response({"error": update_error}, status=400)
    if not row:
        return api_response({"error": "Presente nao encontrado"}, status=404)

    return api_response({"message": "Presente atualizado", "id": row["id"]})


@api_bp.route("/presentes/<int:presente_id>", methods=["DELETE"])
def deletar_presente(presente_id):
    row = delete_presente(presente_id)
    if not row:
        return api_response({"error": "Presente nao encontrado"}, status=404)

    return api_response({"message": "Presente removido", "id": row["id"]})


@api_bp.route("/presentes/<int:presente_id>/reservar", methods=["POST"])
def reservar(presente_id):
    payload = request.get_json(silent=True) or {}

    nome_convidado = str(payload.get("nome_convidado", "")).strip()
    email_convidado = str(payload.get("email_convidado", "")).strip() or None
    telefone_convidado = str(payload.get("telefone_convidado", "")).strip() or None
    mensagem = str(payload.get("mensagem", "")).strip() or None

    if not nome_convidado:
        return api_response({"error": "nome_convidado e obrigatorio"}, status=400)

    reserva, error, status = reservar_presente(
        presente_id,
        nome_convidado,
        email_convidado,
        telefone_convidado,
        mensagem,
    )
    if error:
        return api_response({"error": error}, status=status)

    return api_response(
        {
            "message": "Reserva realizada com sucesso",
            "data": {
                "reserva_id": reserva["id"],
                "presente_id": presente_id,
                "reservado_em": json_default(reserva["criado_em"]),
            },
        },
        status=201,
    )


@api_bp.route("/presentes/<int:presente_id>/cancelar-reserva", methods=["POST"])
def cancelar(presente_id):
    payload = request.get_json(silent=True) or {}
    reserva_id = payload.get("reserva_id")

    row = cancelar_reserva(presente_id, reserva_id=reserva_id)
    if not row:
        return api_response({"error": "Nenhuma reserva ativa encontrada"}, status=404)

    return api_response({"message": "Reserva cancelada", "reserva_id": row["id"]})
