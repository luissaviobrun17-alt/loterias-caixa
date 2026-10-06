import unittest
from motor_duplasena import MotorDuplaSenaB2B


class TestMotorDuplaSenaB2B(unittest.TestCase):

    def setUp(self):
        self.motor_padrao = MotorDuplaSenaB2B(limite_historico=30, estrategia="equilibrada")

    def test_01_geracao_volumes_distintos(self):
        """Testa geração de 1, 5, 10 e 50 jogos com respeito à quantidade e 10 checks."""
        for qtd in [1, 5, 10, 50]:
            res = self.motor_padrao.gerar_carteira(qtd)
            self.assertTrue(res["sucesso"])
            self.assertEqual(res["total_solicitado"], qtd)
            self.assertEqual(res["total_gerado"], qtd)
            self.assertEqual(len(res["jogos"]), qtd)
            self.assertTrue(res["checks_auditoria"]["aprovacao_integral_10_de_10"])

    def test_02_limite_de_consecutivos(self):
        """Regra mandatória: Não pode haver mais de 3 números consecutivos (<=3 permitido, >=4 proibido)."""
        res = self.motor_padrao.gerar_carteira(50)
        for j in res["jogos"]:
            nums = sorted(j["numeros"])
            max_c = MotorDuplaSenaB2B.contar_max_consecutivos(nums)
            self.assertLessEqual(max_c, 3, f"Jogo {nums} excedeu o limite com {max_c} consecutivos!")

    def test_03_ausencia_duplicidades_na_carteira(self):
        """Nenhum jogo pode ser repetido na carteira e nenhuma dezena repetida no jogo."""
        res = self.motor_padrao.gerar_carteira(50)
        jogos_tuplas = [tuple(j["numeros"]) for j in res["jogos"]]
        self.assertEqual(len(jogos_tuplas), len(set(jogos_tuplas)), "Há jogos duplicados na carteira!")
        for j in res["jogos"]:
            self.assertEqual(len(j["numeros"]), len(set(j["numeros"])), "Há números duplicados no jogo!")

    def test_04_range_valido_01_a_50(self):
        """Todos os números devem estar estritamente entre 01 e 50."""
        res = self.motor_padrao.gerar_carteira(30)
        for j in res["jogos"]:
            self.assertEqual(len(j["numeros"]), 6)
            for n in j["numeros"]:
                self.assertTrue(1 <= n <= 50, f"Número {n} fora do range 01-50!")

    def test_05_pool_personalizado(self):
        """Testa respeito estrito ao pool personalizado do apostador."""
        custom_pool = [2, 5, 7, 11, 14, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48]
        motor_custom = MotorDuplaSenaB2B(limite_historico=30, pool=custom_pool)
        res = motor_custom.gerar_carteira(10)
        self.assertTrue(res["sucesso"])
        self.assertEqual(len(res["jogos"]), 10)
        for j in res["jogos"]:
            for n in j["numeros"]:
                self.assertIn(n, custom_pool, f"Número {n} fora do pool personalizado!")

    def test_06_modo_sniper(self):
        """Testa o Modo Sniper com seleção de alta coesão e pontuação IGA."""
        motor_sniper = MotorDuplaSenaB2B(limite_historico=30, estrategia="sniper")
        res = motor_sniper.gerar_carteira(10)
        self.assertTrue(res["sucesso"])
        self.assertEqual(len(res["jogos"]), 10)
        self.assertTrue(res["checks_auditoria"]["aprovacao_integral_10_de_10"])
        for j in res["jogos"]:
            self.assertGreaterEqual(j["score_b2b"], 700)
            self.assertGreaterEqual(j["iga"], 70.0)

    def test_07_janelas_extremas_3_e_100(self):
        """Testa histórico mínimo de 3 concursos e máximo de 100 concursos."""
        motor_3 = MotorDuplaSenaB2B(limite_historico=3)
        res_3 = motor_3.gerar_carteira(5)
        self.assertTrue(res_3["sucesso"])
        self.assertEqual(res_3["relatorio_tecnico"]["concursos_utilizados"], 3)
        self.assertTrue(res_3["checks_auditoria"]["aprovacao_integral_10_de_10"])

        motor_100 = MotorDuplaSenaB2B(limite_historico=100)
        res_100 = motor_100.gerar_carteira(20)
        self.assertTrue(res_100["sucesso"])
        self.assertEqual(res_100["relatorio_tecnico"]["concursos_utilizados"], 100)
        self.assertTrue(res_100["checks_auditoria"]["aprovacao_integral_10_de_10"])

    def test_08_modelos_especificos(self):
        """Testa geração por modelos hipergeométricos 3/3, 2/4, 4/2, 1/5, 5/1."""
        for modelo in ["3/3", "2/4", "4/2", "1/5", "5/1"]:
            motor_mod = MotorDuplaSenaB2B(limite_historico=30, modelo_preferencial=modelo)
            res = motor_mod.gerar_carteira(5)
            self.assertTrue(res["sucesso"])
            for j in res["jogos"]:
                nA = sum(1 for n in j["numeros"] if n <= 25)
                nB = 6 - nA
                self.assertEqual(f"{nA}/{nB}", modelo, f"Modelo gerado {nA}/{nB} diferente do solicitado {modelo}")

    def test_09_bases_sorteio(self):
        """Testa bases de sorteio da Dupla Sena: 1º sorteio, 2º sorteio e combinado."""
        for base in ["1", "2", "combinado"]:
            m = MotorDuplaSenaB2B(limite_historico=30, base_sorteio=base)
            res = m.gerar_carteira(5)
            self.assertTrue(res["sucesso"])
            self.assertEqual(res["base_sorteio"], base)
            self.assertEqual(len(res["jogos"]), 5)

    def test_10_iga_e_explicacao_presentes(self):
        """Garante que cada jogo possui IGA (0-100) e explicação técnica clara."""
        res = self.motor_padrao.gerar_carteira(5)
        for j in res["jogos"]:
            self.assertIn("iga", j)
            self.assertIn("iga_fmt", j)
            self.assertIn("explicacao", j)
            self.assertTrue(isinstance(j["iga"], (int, float)))
            self.assertGreater(len(j["explicacao"]), 10)

    def test_11_backtesting_walk_forward(self):
        """Testa simulação walk-forward sem lookahead bias."""
        bk = self.motor_padrao.executar_backtesting(concursos_teste=5, quantidade_jogos=10)
        self.assertTrue(bk["sucesso"])
        self.assertEqual(bk["concursos_testados"], 5)
        self.assertIn("totais_por_faixa", bk)
        self.assertIn("sena_6", bk["totais_por_faixa"])
        self.assertIn("quina_5", bk["totais_por_faixa"])
        self.assertIn("quadra_4", bk["totais_por_faixa"])
        self.assertIn("terno_3", bk["totais_por_faixa"])

    def test_12_robustez_indicadores(self):
        """Testa módulo de robustez de indicadores."""
        rob = self.motor_padrao.testar_robustez_indicadores()
        self.assertIn("janelas_comparadas", rob)
        self.assertIn("taxa_estabilidade", rob)


if __name__ == "__main__":
    unittest.main()
