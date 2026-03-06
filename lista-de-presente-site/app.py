"""Entrypoint da aplicacao: cria a app Flask via factory e inicia o servidor."""

from app import create_app
from app.config import FLASK_DEBUG

app = create_app()

if __name__ == "__main__":
    app.run(debug=FLASK_DEBUG)
