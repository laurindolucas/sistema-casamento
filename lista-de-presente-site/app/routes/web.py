"""Rota web server-side para renderizar a pagina HTML principal."""

from flask import Blueprint, render_template

from app.services.presentes_service import list_presentes_for_web

web_bp = Blueprint("web", __name__)


@web_bp.route("/")
def index():
    presentes = list_presentes_for_web()

    presentes_tuple = [
        (
            item["id"],
            item["nome_presente"],
            item["descricao"],
            item["valor"],
            item["categoria"],
            item["tipo_pagamento"],
            item["url_image"],
        )
        for item in presentes
    ]

    return render_template("index.html", presentes=presentes_tuple)
