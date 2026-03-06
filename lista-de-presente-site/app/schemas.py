"""Validacoes de payload (entrada) para operacoes de presentes."""

from decimal import Decimal


def validate_presente_payload(payload, partial=False):
    if payload is None:
        return False, "Body JSON obrigatorio"

    required_fields = ["nome_presente", "descricao", "valor", "categoria", "tipo_pagamento"]
    if not partial:
        for field in required_fields:
            if field not in payload:
                return False, f"Campo obrigatorio ausente: {field}"

    if "nome_presente" in payload and not str(payload["nome_presente"]).strip():
        return False, "nome_presente nao pode ser vazio"

    if "valor" in payload:
        try:
            valor = Decimal(str(payload["valor"]))
            if valor < 0:
                return False, "valor nao pode ser negativo"
        except Exception:
            return False, "valor invalido"

    if "quantidade_total" in payload:
        try:
            qtd = int(payload["quantidade_total"])
            if qtd < 1:
                return False, "quantidade_total precisa ser >= 1"
        except Exception:
            return False, "quantidade_total invalida"

    return True, None
