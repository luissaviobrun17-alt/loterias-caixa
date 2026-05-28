# main.py
"""Servidor Flask principal que gerencia o pipeline de loterias.

Disponibiliza rotas para executar a otimização de apostas
e retornar o CSV contendo os tickets gerados.
"""

import os
from pathlib import Path
import csv
from flask import Flask, request, jsonify, send_from_directory

from src.weights import get_frequencies
from src.bibl_design import greedy_covering
from src.ilp_optimizer import select_optimal_tickets
from src.probability import expected_return
from src.kelly import kelly_fraction

app = Flask(__name__, static_folder="frontend", static_url_path="")

OUTPUT_DIR = Path(__file__).resolve().parents[0] / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Garante que temos a pasta data/ para salvar o cache de frequências
DATA_DIR = Path(__file__).resolve().parents[0] / "data"
DATA_DIR.mkdir(exist_ok=True)

# Criar histórico fake caso não exista para evitar falhas imediatas de execução
HIST_FILE = DATA_DIR / "lotofacil_historico.csv"
if not HIST_FILE.exists():
    with open(HIST_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["concurso", "numeros"])
        # gera algumas linhas de teste
        import random
        for i in range(1, 101):
            nums = sorted(random.sample(range(1, 26), 15))
            writer.writerow([str(i), " ".join(f"{n:02d}" for n in nums)])

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    return response

@app.route("/run-pipeline", methods=["POST", "OPTIONS"])
def run_pipeline():
    if request.method == "OPTIONS":
        return jsonify({"success": True})
    try:
        data = request.json or {}
        lottery = data.get("lottery", "lotofacil")
        use_coverage = data.get("use_coverage_ia", True)
        window = int(data.get("window", 15))
        quantity = data.get("quantity")

        from src.ilp_optimizer import LOTTERY_PRICES
        cost_per_ticket = LOTTERY_PRICES.get(lottery, 3.50)

        if quantity is not None:
            quantity = int(quantity)
            budget = quantity * cost_per_ticket
        else:
            budget = float(data.get("budget", 70000))

        # 1. Carregar frequências
        freqs = get_frequencies(lottery, window)

        # Pool de candidatos proporcional à quantidade de jogos solicitada
        candidate_count = max(200, int(quantity * 1.5)) if quantity is not None else 200

        # 2. Gerar dezenas candidatas (Cobertura IA)
        if use_coverage:
            tickets = greedy_covering(lottery, window, n_tickets=candidate_count)
        else:
            tickets = greedy_covering(lottery, window, n_tickets=int(candidate_count * 1.3))

        # 3. Otimizar seleção de apostas via Programação Linear Inteira (ILP)
        selected = select_optimal_tickets(tickets, budget, lottery, window)

        # 4. Dimensionar e calcular valor esperado / Kelly
        rows = []
        for t in selected:
            exp_ret = expected_return(t, freqs, lottery)
            bet_frac = kelly_fraction(exp_ret, cost_per_ticket)
            bet_size = round(cost_per_ticket * (1.0 + bet_frac), 2)  # garante valor mínimo
            rows.append({
                "ticket": " ".join(f"{int(n):02d}" for n in t),
                "valor_esperado": f"{exp_ret:.2f}",
                "valor_aposta": f"{bet_size:.2f}",
            })

        # 5. Salvar CSV na pasta de output
        csv_path = OUTPUT_DIR / f"{lottery}_apostas.csv"
        with csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["ticket", "valor_esperado", "valor_aposta"])
            writer.writeheader()
            writer.writerows(rows)

        download_url = f"/download/{csv_path.name}"
        return jsonify({
            "success": True,
            "download_url": download_url,
            "count": len(rows),
            "rows": rows
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/download/<filename>")
def download(filename):
    return send_from_directory(OUTPUT_DIR, filename, as_attachment=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
