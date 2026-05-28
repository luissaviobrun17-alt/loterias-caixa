# src/ilp_optimizer.py
"""Otimizador ILP para selecionar o subconjunto de tickets que maximiza o valor esperado
dado um orçamento. Utiliza a biblioteca `pulp` (LP/MIP solver).

Assumptions simplificadas:
- Cada ticket tem custo fixo `COST_PER_TICKET` (R$ 56, valor típico da Lotofácil).
- O valor esperado de um ticket é estimado como a soma das probabilidades (frequências)
  dos 15 números que o compõem. Essa é uma proxy simples; pode ser trocada por cálculo
  mais preciso (prêmios de 15/14/13 acertos) se desejado.
- O orçamento total (`budget`) vem da configuração (ex.: R$ 70.000).

Resultado: lista de tickets selecionados (tuplas) e o valor total investido.
"""

import pathlib
from typing import List, Tuple
import pulp

from .weights import get_frequencies
from .probability import expected_return

LOTTERY_PRICES = {
    "megasena": 6.00,
    "lotofacil": 3.50,
    "quina": 3.00,
    "duplasena": 3.00,
    "lotomania": 3.00,
    "timemania": 3.50,
    "diadesorte": 3.00
}

def ticket_score(ticket: Tuple[int, ...], freqs: dict) -> float:
    """Valor esperado simplificado = soma das frequências dos números no ticket."""
    return sum(freqs.get(num, 0) for num in ticket)

def select_optimal_tickets(tickets: List[Tuple[int, ...]], budget: float, lottery: str, window: int = 15) -> List[Tuple[int, ...]]:
    """Resolve o problema de seleção usando ILP.

    Args:
        tickets: lista de tickets.
        budget: orçamento total em reais.
        lottery: nome da loteria para prêmio real.
        window: janela de concursos para calcular as frequências (default 15).
    Returns:
        Subconjunto de tickets que maximiza o retorno esperado dentro do orçamento.
    """
    # Frequências para a janela escolhida
    freqs = get_frequencies(lottery, window)

    # Cria modelo MIP
    model = pulp.LpProblem("TicketSelection", pulp.LpMaximize)

    # Variáveis binárias para cada ticket
    x_vars = [pulp.LpVariable(f"x_{i}", cat="Binary") for i in range(len(tickets))]

    # Custo unitário de aposta da loteria atual
    cost_per_ticket = LOTTERY_PRICES.get(lottery, 3.50)

    # Função objetivo: maximizar soma(retorno_esperado_i * x_i)
    scores = [expected_return(t, freqs, lottery) for t in tickets]
    model += pulp.lpSum(scores[i] * x_vars[i] for i in range(len(tickets)))

    # Restrição de orçamento usando o custo dinâmico
    model += pulp.lpSum(cost_per_ticket * x_vars[i] for i in range(len(tickets))) <= budget

    # Resolve
    model.solve(pulp.PULP_CBC_CMD(msg=False))

    selected = [tickets[i] for i, var in enumerate(x_vars) if var.value() == 1]
    return selected

if __name__ == "__main__":
    # Demo rápido usando a cobertura IA gerada previamente
    from .bibl_design import greedy_covering
    tickets = greedy_covering()
    sel = select_optimal_tickets(tickets, budget=70000, lottery="lotofacil")
    print(f"Selecionados {len(sel)} tickets, investimento total R${len(sel)*COST_PER_TICKET:.2f}")
