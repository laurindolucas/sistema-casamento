"""Entrypoint da aplicacao: cria a app Flask via factory e inicia o servidor."""
from flask import Flask
from flask_cors import CORS
from app import create_app
from app.config import FLASK_DEBUG

app = create_app()
CORS(app)

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG)