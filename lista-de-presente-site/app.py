import os
from flask import Flask, render_template
import psycopg2
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

@app.route("/")
def index():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, nome_presente, descricao, valor, categoria, tipo_pagamento, url_image
        FROM lista_presentes
        ORDER BY criado_em DESC;
    """)
    
    presentes = cur.fetchall()

    cur.close()
    conn.close()

    return render_template("index.html", presentes=presentes)

if __name__ == "__main__":
    app.run(debug=True)