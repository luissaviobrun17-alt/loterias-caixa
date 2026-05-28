# src/kelly.py
"""Módulo para dimensionamento de aposta usando o Critério de Kelly.

Calcula a fração recomendada do saldo (bankroll) com base no valor esperado.
"""

def kelly_fraction(expected_return: float, bet: float = 56.0) -> float:
    """Calcula a fração de Kelly para a aposta.
    
    Odds (b) = expected_return / bet
    Fração f = (p * b - q) / b = p - q/b
    No caso simplificado, limitamos a fração para evitar overbetting.
    """
    if bet <= 0:
        return 0.0
    odds = expected_return / bet
    if odds <= 1.0:
        return 0.0
    
    # Probabilidade estimada de sucesso (baseada nos prêmios reais)
    p = 0.1  # estimativa conservadora
    q = 1.0 - p
    
    f = p - (q / odds)
    # Limita a fração a no máximo 10% do orçamento para gerenciamento de risco (Fractional Kelly)
    return max(0.0, min(f, 0.1))
