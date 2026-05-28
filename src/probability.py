# src/probability.py
"""Módulo de cálculo de retorno esperado usando prêmios reais.

Fornece dicionários de prêmios (em reais) por loteria e número de acertos.
A função `expected_return` combina a frequência dos números com o prêmio
correspondente ao número de acertos que aquele ticket pode alcançar.
"""

from typing import Tuple, List, Dict

# Prêmios padrão (valores aproximados, em reais) – podem ser ajustados posteriormente
PRIZES = {
    "megasena": {
        6: 2_000_000,   # 6 acertos
        5: 200_000,      # 5 acertos
        4: 20_000,       # 4 acertos
    },
    "lotofacil": {
        15: 2_000_000,
        14: 150_000,
        13: 10_000,
    },
    "quina": {
        5: 100_000,
        4: 10_000,
        3: 1_000,
    },
    "duplasena": {
        6: 500_000,
        5: 50_000,
        4: 5_000,
    },
    "lotomania": {
        20: 1_500_000,
        19: 150_000,
        18: 15_000,
        17: 1_500,
    },
    "timemania": {
        7: 200_000,
        6: 20_000,
        5: 2_000,
    },
    "diadesorte": {
        7: 300_000,
        6: 30_000,
        5: 3_000,
    },
}

def expected_return(ticket: Tuple[int, ...], freqs: Dict[int, float], lottery: str) -> float:
    """Calcula o retorno esperado de um *ticket*.

    O cálculo simplificado soma a frequência de cada número do ticket e
    multiplica pelo prêmio médio ponderado. Como a probabilidade exata de
    acertos múltiplos é complexa, usamos uma aproximação baseada na frequência
    média dos números e nos prêmios principais.
    """
    # Frequência média dos números do ticket
    avg_freq = sum(freqs.get(n, 0) for n in ticket) / len(ticket)

    # Seleciona os prêmios da loteria (ordem decrescente de acertos)
    prize_levels = sorted(PRIZES.get(lottery, {}).items(), reverse=True)
    if not prize_levels:
        return 0.0

    # Aproximação: consideramos que a probabilidade de alcançar cada nível
    # é proporcional à frequência média (mais frequente -> maior chance).
    # Distribuímos a média uniformemente entre os níveis.
    prob_per_level = avg_freq / len(prize_levels)
    expected = sum(prob_per_level * prize for _, prize in prize_levels)
    return expected
