"""Factory da aplicacao Flask: registra blueprints, CORS e migracao automatica."""

from flask import Flask

from app.config import AUTO_MIGRATE
from app.routes.api import api_bp
from app.routes.web import web_bp
from app.services.schema_service import ensure_schema

def create_app():
    app = Flask(__name__, template_folder="../templates", static_folder="../static")

    @app.before_request
    def handle_options():
        from flask import request, Response
        if request.method == "OPTIONS":
            res = Response()
            res.headers["Access-Control-Allow-Origin"] = "*"
            res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            res.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
            return res

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
        return response

    app.register_blueprint(api_bp)
    app.register_blueprint(web_bp)

    if AUTO_MIGRATE:
        ensure_schema()

    return app