# src/weights.py
"""Cálculo de frequências reais das dezenas a partir do histórico do frontend.

Lê e parseia o arquivo `js/data/history_db.js` para extrair os resultados das
loterias e calcular a frequência de saída de cada número de acordo com as regras de cada jogo.
"""

import pathlib
import json
import re
from typing import Dict, List

BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
HISTORY_DB_FILE = BASE_DIR / "js" / "data" / "history_db.js"
CACHE_FILE = BASE_DIR / "data" / "freq_cache.json"

# Configurações de limites e tamanhos para cada loteria
LOTTERY_CONFIGS = {
    "megasena": {"min_val": 1, "max_val": 60, "draw_size": 6},
    "lotofacil": {"min_val": 1, "max_val": 25, "draw_size": 15},
    "quina": {"min_val": 1, "max_val": 80, "draw_size": 5},
    "duplasena": {"min_val": 1, "max_val": 50, "draw_size": 6},
    "lotomania": {"min_val": 0, "max_val": 99, "draw_size": 20},
    "timemania": {"min_val": 1, "max_val": 80, "draw_size": 7},
    "diadesorte": {"min_val": 1, "max_val": 31, "draw_size": 7},
}

def parse_history_db() -> Dict[str, List[List[int]]]:
    """Parseia o arquivo js/data/history_db.js para extrair os sorteios por loteria.
    
    Retorna:
        Um dicionário contendo as loterias como chaves e listas de dezenas sorteadas.
    """
    db = {}
    current_lottery = None
    
    if not HISTORY_DB_FILE.exists():
        raise FileNotFoundError(f"Arquivo de histórico não encontrado em {HISTORY_DB_FILE}")
        
    with open(HISTORY_DB_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("//"):
                continue
            
            # Detecta o início de uma loteria, ex: "megasena: ["
            lot_match = re.match(r"^(\w+)\s*:\s*\[", line)
            if lot_match:
                current_lottery = lot_match.group(1)
                db[current_lottery] = []
                continue
            
            # Extrai os números do sorteio
            if current_lottery and "numbers" in line:
                # regex para pegar tudo que está dentro de numbers: [...]
                num_match = re.search(r"numbers\s*:\s*\[([^\]]+)\]", line)
                if num_match:
                    nums_str = num_match.group(1)
                    nums = [int(n.strip()) for n in nums_str.split(",") if n.strip().isdigit()]
                    
                    # Ajuste específico para Dupla Sena: pegar apenas os primeiros 6 números (primeiro sorteio)
                    if current_lottery == "duplasena" and len(nums) > 6:
                        nums = nums[:6]
                        
                    db[current_lottery].append(nums)
                    
            # Detecta o fim da lista de sorteios da loteria atual
            if line == "]," or line == "]":
                current_lottery = None
                
    return db

def compute_frequencies(draws: List[List[int]], lottery: str, window: int) -> Dict[int, float]:
    """Calcula a frequência dos números nos últimos `window` concursos.
    
    Frequência = contagem / (window * draw_size).
    """
    config = LOTTERY_CONFIGS.get(lottery)
    if not config:
        raise ValueError(f"Loteria não configurada: {lottery}")
        
    min_val = config["min_val"]
    max_val = config["max_val"]
    draw_size = config["draw_size"]
    
    # Inicializa contagens para todas as dezenas possíveis
    counts = {n: 0 for n in range(min_val, max_val + 1)}
    
    # Pega os últimos `window` concursos disponíveis (de trás para a frente no histórico)
    recent_draws = draws[:window]
    actual_window = len(recent_draws)
    
    if actual_window == 0:
        # Se não há concursos, retorna probabilidade uniforme padrão
        return {n: 1.0 / (max_val - min_val + 1) for n in counts}
        
    for draw in recent_draws:
        for n in draw:
            if n in counts:
                counts[n] += 1
                
    total_spots = actual_window * draw_size
    return {n: counts[n] / total_spots for n in counts}

def load_cache() -> Dict[str, Dict[str, float]]:
    """Carrega o cache de frequências do arquivo JSON se existir."""
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache: Dict[str, Dict[str, float]]) -> None:
    """Salva o cache de frequências no arquivo JSON."""
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def get_frequencies(lottery: str, window: int) -> Dict[int, float]:
    """Obtém as frequências calculadas, usando cache para acelerar."""
    cache = load_cache()
    cache_key = f"{lottery}_{window}"
    
    if cache_key in cache:
        # Reconverte chaves de volta para int (JSON armazena chaves como strings)
        return {int(k): v for k, v in cache[cache_key].items()}
        
    # Carrega todo o banco de dados parseado do history_db.js
    db = parse_history_db()
    draws = db.get(lottery, [])
    
    # Calcula frequências
    freqs = compute_frequencies(draws, lottery, window)
    
    # Salva no cache (salva como string para ser válido em JSON)
    cache[cache_key] = {str(k): v for k, v in freqs.items()}
    save_cache(cache)
    
    return freqs

if __name__ == "__main__":
    # Teste rápido de sanidade
    import sys
    print("Testando parser e cálculo de frequências:")
    try:
        db = parse_history_db()
        for lot in LOTTERY_CONFIGS.keys():
            if lot in db:
                print(f"- {lot}: {len(db[lot])} sorteios carregados.")
                freqs = get_frequencies(lot, 15)
                print(f"  Frequências calculadas para 15 concursos. Exemplo (número mais quente):")
                max_num = max(freqs.keys(), key=freqs.get)
                print(f"  Dezena {max_num:02d} com freq {freqs[max_num]:.4f}")
            else:
                print(f"- {lot}: NÃO encontrado no history_db.js!")
    except Exception as e:
        print(f"ERRO: {e}", file=sys.stderr)
