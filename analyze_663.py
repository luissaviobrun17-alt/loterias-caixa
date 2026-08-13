import json
import re
import os
import random

transcript_path = r"C:\Users\Luis Brun\.gemini\antigravity\brain\113a7c78-fee5-41cd-9745-851390081aee\.system_generated\logs\transcript_full.jsonl"

def main():
    if not os.path.exists(transcript_path):
        print(f"Error: Transcript path not found at {transcript_path}")
        return

    # Read the transcript to find the last USER_INPUT message
    user_messages = []
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get('type') == 'USER_INPUT':
                    user_messages.append(data.get('content', ''))
            except Exception as e:
                pass

    if not user_messages:
        print("Error: No user messages found in transcript.")
        return

    last_message = user_messages[-1]
    
    # Extract games matching "Jogo \d+: (.*)"
    game_lines = re.findall(r"Jogo \d+: ([\d\s\-]+)", last_message)
    if not game_lines:
        print("Error: No games found in the last user message.")
        return

    print(f"Found {len(game_lines)} games in the last user message.")
    
    jogos = []
    for line in game_lines:
        dezenas = [int(x.strip()) for x in line.split("-") if x.strip().isdigit()]
        if len(dezenas) == 50:
            jogos.append(dezenas)
            
    print(f"Successfully parsed {len(jogos)} valid games of size 50.")
    if not jogos:
        return

    # Common intersection of all games (fixed numbers)
    fixos = set(jogos[0])
    for j in jogos[1:]:
        fixos = fixos.intersection(set(j))
        
    print("\nDezenas Fixas reais encontradas (interseção comum):")
    print(sorted(list(fixos)))
    print("Quantidade de fixos reais:", len(fixos))

    # Total Pool
    pool = set()
    for j in jogos:
        pool.update(j)
    print("Pool total de dezenas selecionadas:", len(pool))
    print(sorted(list(pool)))

    # Variables
    variaveis = pool - fixos
    print("Quantidade de variáveis:", len(variaveis))

    # Monte Carlo simulation
    # Sorteamos 20 dezenas de todo o pool de dezenas selecionadas.
    random.seed(42)
    sucessos_20 = 0
    sucessos_19 = 0
    sucessos_18 = 0
    sucessos_17 = 0
    sucessos_16 = 0
    total_simulacoes = 100000

    for _ in range(total_simulacoes):
        sorteio = set(random.sample(list(pool), 20))
        max_acertos = 0
        for j in jogos:
            acertos = len(set(j) & sorteio)
            if acertos > max_acertos:
                max_acertos = acertos
                
        if max_acertos >= 20:
            sucessos_20 += 1
        if max_acertos >= 19:
            sucessos_19 += 1
        if max_acertos >= 18:
            sucessos_18 += 1
        if max_acertos >= 17:
            sucessos_17 += 1
        if max_acertos >= 16:
            sucessos_16 += 1

    print(f"\nSimulação de Cobertura para {len(jogos)} Jogos (100.000 sorteios do pool):")
    print(f"Taxa de Sucesso (>= 20 acertos): {sucessos_20/total_simulacoes*100:.4f}% ({sucessos_20} de {total_simulacoes})")
    print(f"Taxa de Sucesso (>= 19 acertos): {sucessos_19/total_simulacoes*100:.4f}% ({sucessos_19} de {total_simulacoes})")
    print(f"Taxa de Sucesso (>= 18 acertos): {sucessos_18/total_simulacoes*100:.4f}% ({sucessos_18} de {total_simulacoes})")
    print(f"Taxa de Sucesso (>= 17 acertos): {sucessos_17/total_simulacoes*100:.4f}% ({sucessos_17} de {total_simulacoes})")
    print(f"Taxa de Sucesso (>= 16 acertos): {sucessos_16/total_simulacoes*100:.4f}% ({sucessos_16} de {total_simulacoes})")

if __name__ == "__main__":
    main()
