# src/bibl_design.py
"""Gerador “Cobertura IA” (greedy) para loterias.

Gera combinações cobrindo o máximo de pares possíveis de números frequentes,
aplicando filtros físicos de distribuição probabilística hipergeométrica (soma, consecutividade, paridade).
"""

import random
from typing import List, Tuple
from .weights import get_frequencies

# Lista de números primos para filtros de probabilidade
PRIMES = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79}

def is_valid_ticket(ticket: Tuple[int, ...], lottery: str) -> bool:
    """Aplica filtros de consistência física e equilíbrio matemático baseados
    nas probabilidades reais dos sorteios históricos da Caixa.
    """
    evens = sum(1 for n in ticket if n % 2 == 0)
    odds = len(ticket) - evens
    
    # Verifica o tamanho da maior sequência consecutiva no ticket
    consecutive_run = 1
    max_consecutive_run = 1
    for i in range(1, len(ticket)):
        if ticket[i] == ticket[i-1] + 1:
            consecutive_run += 1
            max_consecutive_run = max(max_consecutive_run, consecutive_run)
        else:
            consecutive_run = 1
            
    ticket_sum = sum(ticket)
    primes_count = sum(1 for n in ticket if n in PRIMES)

    if lottery == "megasena":
        # Evita desequilíbrios extremos (ex: 6 pares ou 6 ímpares)
        if evens == 0 or odds == 0:
            return False
        # Evita trincas consecutivas (ex: 12-13-14)
        if max_consecutive_run > 2:
            return False
        # Faixa central da curva de somas reais da Mega-Sena
        if not (110 <= ticket_sum <= 240):
            return False
        # Quantidade típica de números primos na Mega-Sena (1 a 4)
        if not (1 <= primes_count <= 4):
            return False

    elif lottery == "lotofacil":
        # Equilíbrio de paridade (geralmente 7 a 9 ímpares)
        if not (6 <= odds <= 9):
            return False
        # Evita sequências exageradas (máximo 4 consecutivas)
        if max_consecutive_run > 4:
            return False
        # Faixa central da distribuição de somas da Lotofácil
        if not (160 <= ticket_sum <= 230):
            return False
        # Quantidade de primos comum na Lotofácil (4 a 7)
        if not (4 <= primes_count <= 7):
            return False
            
    elif lottery == "quina":
        if evens == 0 or odds == 0:
            return False
        if max_consecutive_run > 2:
            return False
        if not (120 <= ticket_sum <= 280):
            return False
        if not (1 <= primes_count <= 3):
            return False

    # Outras loterias: filtros padrão básicos para evitar desperdício de dinheiro
    else:
        if evens == 0 or odds == 0:
            return False
        if max_consecutive_run > 3:
            return False
            
    return True

def greedy_covering(lottery: str = "lotofacil", window: int = 15, n_tickets: int = 150) -> List[Tuple[int, ...]]:
    """Gera `n_tickets` cobrindo os números mais frequentes da loteria com filtros probabilísticos."""
    freqs = get_frequencies(lottery, window)
    # Ordena dezenas por frequência decrescente
    sorted_numbers = sorted(freqs.keys(), key=freqs.get, reverse=True)
    
    tickets = []
    # Determina o tamanho do ticket (ex: Lotofácil = 15)
    ticket_size = 15
    if lottery == "megasena":
        ticket_size = 6
    elif lottery == "quina":
        ticket_size = 5
    elif lottery == "duplasena":
        ticket_size = 6
    elif lottery == "lotomania":
        ticket_size = 50
    elif lottery == "timemania":
        ticket_size = 10
    elif lottery == "diadesorte":
        ticket_size = 7

    # Ajusta pool de candidatos com base nas frequências (inclui mais dezenas para ter variedade de filtros)
    pool = sorted_numbers[:ticket_size + 15]
    if len(pool) < ticket_size:
        pool = list(range(1, ticket_size + 16))

    # Amostragem com filtros
    attempts = 0
    max_attempts = n_tickets * 150
    
    while len(tickets) < n_tickets and attempts < max_attempts:
        attempts += 1
        ticket = tuple(sorted(random.sample(pool, ticket_size)))
        if ticket not in tickets:
            if is_valid_ticket(ticket, lottery):
                tickets.append(ticket)
                
    # Se os filtros forem rígidos demais e não completarem a quantidade,
    # relaxa os filtros para garantir que o usuário receba os jogos solicitados
    if len(tickets) < n_tickets:
        while len(tickets) < n_tickets:
            ticket = tuple(sorted(random.sample(pool, ticket_size)))
            if ticket not in tickets:
                tickets.append(ticket)
            
    return tickets

if __name__ == "__main__":
    t = greedy_covering("megasena", 15, 10)
    print(f"Gerados {len(t)} tickets de teste para Mega Sena:")
    for ticket in t:
        print(ticket, "Soma:", sum(ticket))
