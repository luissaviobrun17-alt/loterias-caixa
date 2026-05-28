# test_all_lotteries.py
import sys
from src.weights import get_frequencies, parse_history_db
from src.bibl_design import greedy_covering
from src.ilp_optimizer import select_optimal_tickets, LOTTERY_PRICES
from src.probability import expected_return

def main():
    print("Iniciando testes integrados do backend de loterias...")
    
    # 1. Teste de parse do banco de dados
    try:
        db = parse_history_db()
        print(f"[OK] parse_history_db: {len(db)} loterias carregadas.")
    except Exception as e:
        print(f"[FAIL] parse_history_db falhou: {e}")
        sys.exit(1)
        
    loterias = ["megasena", "lotofacil", "quina", "duplasena", "lotomania", "timemania", "diadesorte"]
    
    for lottery in loterias:
        print(f"\nTestando loteria: {lottery}")
        try:
            # 2. Teste de Frequências
            freqs = get_frequencies(lottery, 15)
            print(f"  - Frequências: {len(freqs)} números mapeados.")
            
            # 3. Teste de greedy_covering
            tickets = greedy_covering(lottery, 15, n_tickets=30)
            print(f"  - Cobertura: Gerou {len(tickets)} tickets. Tamanho de cada ticket: {len(tickets[0])}")
            
            # 4. Teste de ilp_optimizer
            cost = LOTTERY_PRICES.get(lottery, 3.50)
            budget = cost * 10 # orçamento para 10 apostas
            selected = select_optimal_tickets(tickets, budget, lottery, 15)
            print(f"  - Otimizador ILP: Selecionou {len(selected)} tickets de um orçamento de R${budget:.2f} (custo unitário R${cost:.2f})")
            
            if len(selected) > 0:
                print(f"  - Amostra do primeiro ticket selecionado: {selected[0]}")
                exp_ret = expected_return(selected[0], freqs, lottery)
                print(f"  - Retorno Esperado do ticket: {exp_ret:.4f}")
            else:
                print(f"  - [AVISO] Nenhum ticket selecionado para {lottery}")
                
        except Exception as e:
            print(f"  - [FAIL] Erro em {lottery}: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
            
    print("\n[SUCESSO] Todos os testes passaram!")

if __name__ == "__main__":
    main()
