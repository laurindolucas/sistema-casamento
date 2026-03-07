"""Utilitarios compartilhados: parse de tipos, serializacao e resposta JSON."""

from datetime import datetime
from decimal import Decimal

from flask import jsonify


def parse_bool(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "t", "sim", "yes", "y"}


def parse_int(value, default, min_value=None, max_value=None):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = default

    if min_value is not None:
        parsed = max(parsed, min_value)
    if max_value is not None:
        parsed = min(parsed, max_value)
    return parsed


def json_default(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def serialize_row(row):
    return {k: json_default(v) for k, v in row.items()}


def api_response(payload, status=200):
    response = jsonify(payload)
    response.status_code = status
    return response
