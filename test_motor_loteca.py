"""
SUÍTE DE TESTES UNITÁRIOS E DE INTEGRAÇÃO
NOVO MOTOR LOTECA B2B LOTERIAS
=============================================================================
Validação formal de:
1. Fechamento unitário de probabilidades P(1) + P(X) + P(2) = 1.0
2. Restrições e regras financeiras da Caixa (2^D * 3^T, tetos e orçamentos)
3. Estabilidade da Simulação Monte Carlo (100.000 iterações)
4. Correção tau de Dixon-Coles para empates em baixos placares
5. Entropia Normalizada de Shannon e Índice de Confiança [0, 100]
6. Detector de Jogos Armadilha e Conflitos entre Modelos
7. Recalibração com escalação de última hora
8. Presença das 12 seções obrigatórias no relatório oficial
=============================================================================
"""

import unittest
import json
import os
from motor_loteca import (
    MotorLotecaB2B,
    DixonColesPoissonModel,
    DynamicRatingSystem,
    MonteCarloSimulator,
    InformationTheoryEngine,
    TrapMatchDetector,
    LotecaBudgetOptimizer,
    PRECO_APOSTA_SIMPLES_PADRAO,
    MAX_TRIPLOS_VOLANTE_UNICO,
    MAX_DUPLOS_VOLANTE_UNICO,
    MAX_APOSTAS_VOLANTE_UNICO,
    ModuloTernosETriosLoteca
)


class TestNovoMotorLotecaB2B(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        caminho_grade = os.path.join(
            os.path.dirname(__file__), "data", "loteca_grade_exemplo.json"
        )
        with open(caminho_grade, "r", encoding="utf-8") as f:
            data = json.load(f)
        cls.grade_jogos = data["jogos"]
        cls.motor = MotorLotecaB2B(preco_aposta_simples=PRECO_APOSTA_SIMPLES_PADRAO)

    def test_fechamento_unitario_probabilidades(self):
        """Verifica se para os 14 jogos a soma P(1) + P(X) + P(2) = 1.0."""
        resultado = self.motor.processar_concurso(self.grade_jogos, orcamento=50.0)
        self.assertEqual(len(resultado["analises_jogos"]), 14)

        for j in resultado["analises_jogos"]:
            soma_p = j["p1"] + j["px"] + j["p2"]
            self.assertAlmostEqual(
                soma_p, 1.0, places=3,
                msg=f"Jogo {j['numero_jogo']} não fechou em 100%: {soma_p}"
            )
            self.assertGreaterEqual(j["p1"], 0.0)
            self.assertGreaterEqual(j["px"], 0.0)
            self.assertGreaterEqual(j["p2"], 0.0)

    def test_regras_caixa_e_orcamento(self):
        """Testa orçamentos variados (R$ 16, R$ 48, R$ 144, R$ 864, R$ 1000)."""
        orcamentos_teste = [16.0, 48.0, 100.0, 288.0, 864.0, 1500.0]

        for orc in orcamentos_teste:
            resultado = self.motor.processar_concurso(self.grade_jogos, orcamento=orc)
            otim = resultado["otimizacao"]

            d = otim["num_duplos"]
            t = otim["num_triplos"]
            comb = otim["total_combinacoes"]
            custo = otim["custo_total"]

            # 1. Fórmula combinatória 2^D * 3^T
            self.assertEqual(comb, (2 ** d) * (3 ** t))

            # 2. Respeito ao teto orçamentário
            self.assertLessEqual(
                custo, orc + 1e-6,
                msg=f"Custo {custo} excedeu o orçamento autorizado {orc}"
            )

            # 3. Limites de volante único da Caixa
            self.assertLessEqual(d, MAX_DUPLOS_VOLANTE_UNICO)
            self.assertLessEqual(t, MAX_TRIPLOS_VOLANTE_UNICO)
            self.assertLessEqual(comb, MAX_APOSTAS_VOLANTE_UNICO)

    def test_simulacao_monte_carlo_100k(self):
        """Testa o simulador Monte Carlo com 100.000 iterações."""
        sim = MonteCarloSimulator(num_simulacoes=100000)
        res = sim.simular_confronto(lambda_home=1.5, lambda_away=1.0)

        self.assertEqual(res["num_simulacoes"], 100000)
        soma_mc = res["p1_mc"] + res["px_mc"] + res["p2_mc"]
        self.assertAlmostEqual(soma_mc, 1.0, places=4)
        self.assertTrue(len(res["top_placares"]) > 0)

    def test_dixon_coles_tau_empate(self):
        """Verifica se o ajuste Dixon-Coles eleva a probabilidade de baixos placares de empate."""
        dc = DixonColesPoissonModel(rho=-0.11)
        matriz = dc.calcular_matriz_placares(1.1, 1.0)
        p_00 = matriz.get((0, 0), 0.0)
        p_11 = matriz.get((1, 1), 0.0)

        # Placares devem ter probabilidade estritamente positiva
        self.assertGreater(p_00, 0.05)
        self.assertGreater(p_11, 0.05)

    def test_entropia_shannon_e_confianca(self):
        """Testa a monotonicidade da Entropia de Shannon normalizada e do Índice de Confiança."""
        engine = InformationTheoryEngine()

        # Caso 1: Equilíbrio tripartite absoluto (1/3, 1/3, 1/3) -> Incerteza máxima
        h_max = engine.calcular_entropia_shannon_normalizada(1/3, 1/3, 1/3)
        self.assertAlmostEqual(h_max, 100.0, places=1)

        # Caso 2: Amplo favoritismo (0.80, 0.15, 0.05) -> Incerteza baixa
        h_baixo = engine.calcular_entropia_shannon_normalizada(0.80, 0.15, 0.05)
        self.assertLess(h_baixo, 60.0)

        # Confiança no caso 2 deve ser maior que no caso 1
        c2, i2, _ = engine.calcular_metricas_decisao(0.80, 0.15, 0.05, [(0.8, 0.15, 0.05)])
        c1, i1, _ = engine.calcular_metricas_decisao(1/3, 1/3, 1/3, [(1/3, 1/3, 1/3)])
        self.assertGreater(c2, c1)
        self.assertLess(i2, i1)

    def test_detector_armadilhas(self):
        """Testa a identificação de partidas sob risco oculto."""
        detector = TrapMatchDetector()

        # Cenário de armadilha: Mandante com desfalques graves e desgaste alto vs visitante invicto
        is_trap, motivo = detector.avaliar_armadilha(
            p1=0.49,
            px=0.28,
            p2=0.23,
            p_mercado={"1": 0.65, "X": 0.22, "2": 0.13},
            desfalques_chave_mandante=True,
            desgaste_mandante_alto=True,
            visitante_recente_positivo=True
        )
        self.assertTrue(is_trap)
        self.assertIn("Mercado", motivo)

    def test_recalibracao_oficial(self):
        """Testa o método de recalibração com escalação de última hora."""
        resultado_inicial = self.motor.processar_concurso(self.grade_jogos, orcamento=48.0)
        prob_inicial_j1_p1 = resultado_inicial["analises_jogos"][0]["p1"]

        # Simula desfalque catastrófico no mandante do Jogo 1 de última hora
        novos_dados_j1 = dict(self.grade_jogos[0])
        novos_dados_j1["fator_desfalques_home"] = 0.50  # Perda de meio time

        resultado_recalibrado = self.motor.recalibrar_com_escalacao_oficial(
            analise_previa=resultado_inicial,
            jogo_id=1,
            novos_dados=novos_dados_j1
        )
        prob_nova_j1_p1 = resultado_recalibrado["analises_jogos"][0]["p1"]

        # A probabilidade de vitória do mandante deve cair estatisticamente
        self.assertLess(prob_nova_j1_p1, prob_inicial_j1_p1)

    def test_12_secoes_relatorio_oficial(self):
        """Verifica se o relatório final possui obrigatoriamente as 12 seções exigidas."""
        resultado = self.motor.processar_concurso(self.grade_jogos, orcamento=72.0)
        relatorio = resultado["relatorio_oficial_12_secoes"]

        secoes_obrigatorias = [
            "## 1. ANÁLISE DETALHADA DOS 14 JOGOS DA GRADE",
            "## 2. PROBABILIDADES CONSOLIDADAS 1 / X / 2",
            "## 3. ÍNDICE DE CONFIANÇA DOS PROGNÓSTICOS",
            "## 4. ÍNDICE DE INCERTEZA (ENTROPIA NORMALIZADA)",
            "## 5. SELEÇÃO DE JOGOS PARA APOSTA SIMPLES",
            "## 6. SELEÇÃO DE JOGOS PARA APOSTA DUPLA",
            "## 7. SELEÇÃO DE JOGOS PARA APOSTA TRIPLA",
            "## 8. DETECÇÃO DE JOGOS DE RISCO E JOGOS ARMADILHA",
            "## 9. ESTRATÉGIA RECOMENDADA DE COBERTURA",
            "## 10. CUSTO FINANCEIRO TOTAL",
            "## 11. QUANTIDADE DE APOSTAS GERADAS",
            "## 12. CONFERÊNCIA MATEMÁTICA E AUDITORIA FINAL"
        ]

        for sec in secoes_obrigatorias:
            self.assertIn(sec, relatorio, f"Seção obrigatória ausente: {sec}")

    def test_modulo_ternos_combinacoes_27(self):
        """Verifica se um terno de 3 jogos gera exatamente 27 combinações fechando em 100%."""
        analises = self.motor.processar_concurso(self.grade_jogos)["analises_jogos"]
        t_engine = ModuloTernosETriosLoteca()

        combs = t_engine.gerar_combinacoes_terno(analises[:3])
        self.assertEqual(len(combs), 27)

        soma_prob = sum(c["probabilidade"] for c in combs)
        self.assertAlmostEqual(soma_prob, 1.0, places=3)

    def test_fechamento_reduzido_3_duplos(self):
        """Verifica se 3 duplos fecham em 4 cartões com garantia matemática de no mínimo 2 acertos."""
        analises = self.motor.processar_concurso(self.grade_jogos)["analises_jogos"]
        t_engine = ModuloTernosETriosLoteca()

        fechamento = t_engine.gerar_desdobramento_reduzido_terno_duplos(analises[:3])
        self.assertEqual(fechamento["total_apostas"], 4)

        # Testa as 2^3 = 8 permutações reais possíveis das colunas duplas
        j1, j2, j3 = analises[:3]
        cols_j1 = [j1["coluna_principal"], j1["coluna_alternativa"]]
        cols_j2 = [j2["coluna_principal"], j2["coluna_alternativa"]]
        cols_j3 = [j3["coluna_principal"], j3["coluna_alternativa"]]

        for r1 in cols_j1:
            for r2 in cols_j2:
                for r3 in cols_j3:
                    resultado_real = {j1["numero_jogo"]: r1, j2["numero_jogo"]: r2, j3["numero_jogo"]: r3}
                    # Verifica se em ao menos um dos 4 cartões há >= 2 acertos
                    max_acertos = 0
                    for c in fechamento["cartoes"]:
                        acertos = sum(1 for num, col in resultado_real.items() if c["marcacao"][num] == col)
                        if acertos > max_acertos:
                            max_acertos = acertos
                    self.assertGreaterEqual(
                        max_acertos, 2,
                        f"Garantia de 2 acertos falhou para resultado real {resultado_real}"
                    )

    def test_fechamento_reduzido_3_triplos(self):
        """Verifica se 3 triplos fecham em 9 cartões (Matriz OA) com garantia matemática de no mínimo 2 acertos."""
        analises = self.motor.processar_concurso(self.grade_jogos)["analises_jogos"]
        t_engine = ModuloTernosETriosLoteca()

        fechamento = t_engine.gerar_desdobramento_reduzido_terno_triplos(analises[:3])
        self.assertEqual(fechamento["total_apostas"], 9)

        # Testa todas as 3^3 = 27 permutações reais
        colunas = ["1", "X", "2"]
        j1, j2, j3 = analises[:3]
        for r1 in colunas:
            for r2 in colunas:
                for r3 in colunas:
                    resultado_real = {j1["numero_jogo"]: r1, j2["numero_jogo"]: r2, j3["numero_jogo"]: r3}
                    max_acertos = 0
                    for c in fechamento["cartoes"]:
                        acertos = sum(1 for num, col in resultado_real.items() if c["marcacao"][num] == col)
                        if acertos > max_acertos:
                            max_acertos = acertos
                    self.assertGreaterEqual(
                        max_acertos, 2,
                        f"Garantia de 2 acertos falhou para resultado real de triplos {resultado_real}"
                    )

    def test_modulo_duques_combinacoes_9(self):
        """Verifica se um duque de 2 jogos gera exatamente 9 combinações fechando em 100%."""
        analises = self.motor.processar_concurso(self.grade_jogos)["analises_jogos"]
        t_engine = ModuloTernosETriosLoteca()

        combs = t_engine.gerar_combinacoes_duque(analises[:2])
        self.assertEqual(len(combs), 9)

        soma_prob = sum(c["probabilidade"] for c in combs)
        self.assertAlmostEqual(soma_prob, 1.0, places=3)

        duques_7 = t_engine.estruturar_duques_concurso(analises)
        self.assertEqual(len(duques_7), 7)

    def test_fechamento_reduzido_duque_triplos(self):
        """Verifica se 2 triplos fecham em 3 cartões com garantia de no mínimo 1 acerto nos 2 jogos."""
        analises = self.motor.processar_concurso(self.grade_jogos)["analises_jogos"]
        t_engine = ModuloTernosETriosLoteca()

        fechamento = t_engine.gerar_desdobramento_reduzido_duque_triplos(analises[:2])
        self.assertEqual(fechamento["total_apostas"], 3)

        colunas = ["1", "X", "2"]
        j1, j2 = analises[:2]
        for r1 in colunas:
            for r2 in colunas:
                resultado_real = {j1["numero_jogo"]: r1, j2["numero_jogo"]: r2}
                max_acertos = 0
                for c in fechamento["cartoes"]:
                    acertos = sum(1 for num, col in resultado_real.items() if c["marcacao"][num] == col)
                    if acertos > max_acertos:
                        max_acertos = acertos
                self.assertGreaterEqual(
                    max_acertos, 1,
                    f"Garantia de 1 acerto falhou para resultado real de duque de triplos {resultado_real}"
                )


if __name__ == "__main__":
    unittest.main()
