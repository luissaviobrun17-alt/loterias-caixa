
// js/engines/games.js
// Premiações baseadas nas faixas oficiais da Caixa Econômica Federal
// Os valores de prize são referências aproximadas (prêmio fixo onde existe,
// ou estimativa de acumulado para o prêmio principal)
// ═══ ATUALIZADO V10: Todas as faixas de premiação corrigidas ═══

const GAMES = {
    megasena: {
        name: "Mega Sena",
        range: [1, 60],
        draw: 6,
        color: "#209A3C",
        colorGrad: "#0d6b28",
        cols: 10,
        price: 6.00,
        // Faixas: Sena (6), Quina (5), Quadra (4), Terno (3)
        strategies: [
            { id: "sena",   label: "Sena (6 acertos)",   match: 6, prize: 50000000, paid: true  },
            { id: "quina",  label: "Quina (5 acertos)",   match: 5, prize: 50000,    paid: true  },
            { id: "quadra", label: "Quadra (4 acertos)",  match: 4, prize: 1000,     paid: true  },
            { id: "terno",  label: "Terno (3 acertos)",   match: 3, prize: 5,        paid: true  }
        ],
        closingLevels: [
            { id: "close6", label: "Fechamento Sena (6)",   guarantee: 6, icon: "🎯" },
            { id: "close5", label: "Fechamento Quina (5)",  guarantee: 5, icon: "⭐" },
            { id: "close4", label: "Fechamento Quadra (4)", guarantee: 4, icon: "🔥" },
            { id: "close3", label: "Fechamento Terno (3)",  guarantee: 3, icon: "✅" }
        ],
        minBet: 6,
        maxBet: 60,
        statsCount: 20
    },
    lotofacil: {
        name: "Lotofácil",
        range: [1, 25],
        draw: 15,
        color: "#930089",
        colorGrad: "#5e0058",
        cols: 5,
        price: 3.50,
        // Faixas oficiais: 15, 14, 13, 12, 11 acertos
        strategies: [
            { id: "15pts", label: "15 Pontos",  match: 15, prize: 2000000, paid: true  },
            { id: "14pts", label: "14 Pontos",  match: 14, prize: 1600,    paid: true  },
            { id: "13pts", label: "13 Pontos",  match: 13, prize: 30,      paid: true  },
            { id: "12pts", label: "12 Pontos",  match: 12, prize: 12,      paid: true  },
            { id: "11pts", label: "11 Pontos",  match: 11, prize: 6,       paid: true  }
        ],
        closingLevels: [
            { id: "close15", label: "Fechamento 15 Pontos",  guarantee: 15, icon: "🎯" },
            { id: "close14", label: "Fechamento 14 Pontos",  guarantee: 14, icon: "⭐" },
            { id: "close13", label: "Fechamento 13 Pontos",  guarantee: 13, icon: "🔥" },
            { id: "close12", label: "Fechamento 12 Pontos",  guarantee: 12, icon: "💎" },
            { id: "close11", label: "Fechamento 11 Pontos",  guarantee: 11, icon: "👑" }
        ],
        minBet: 15,
        maxBet: 25,
        maxFixed: 10,
        statsCount: 15
    },
    quina: {
        name: "Quina",
        range: [1, 80],
        draw: 5,
        color: "#3062a8",
        colorGrad: "#1a3d6b",
        cols: 10,
        price: 3.00,
        // Faixas oficiais: Quina (5), Quadra (4), Terno (3), Duque (2)
        strategies: [
            { id: "quina",  label: "Quina (5 acertos)",   match: 5, prize: 6000000, paid: true  },
            { id: "quadra", label: "Quadra (4 acertos)",   match: 4, prize: 6500,    paid: true  },
            { id: "terno",  label: "Terno (3 acertos)",    match: 3, prize: 4,       paid: true  },
            { id: "duque",  label: "Duque (2 acertos)",    match: 2, prize: 2,       paid: true  }
        ],
        closingLevels: [
            { id: "close5", label: "Fechamento Quina (5)",  guarantee: 5, icon: "🎯" },
            { id: "close4", label: "Fechamento Quadra (4)", guarantee: 4, icon: "⭐" },
            { id: "close3", label: "Fechamento Terno (3)",  guarantee: 3, icon: "🔥" }
        ],
        minBet: 5,
        maxBet: 80,
        statsCount: 30
    },
    duplasena: {
        name: "Dupla Sena",
        range: [1, 50],
        draw: 6,
        color: "#e8000f",
        colorGrad: "#8f0009",
        cols: 10,
        price: 3.00,
        // Faixas oficiais: Sena (6), Quina (5), Quadra (4), Terno (3)
        strategies: [
            { id: "sena",   label: "Sena (6 acertos)",   match: 6, prize: 2500000, paid: true  },
            { id: "quina",  label: "Quina (5 acertos)",   match: 5, prize: 5000,    paid: true  },
            { id: "quadra", label: "Quadra (4 acertos)",  match: 4, prize: 130,     paid: true  },
            { id: "terno",  label: "Terno (3 acertos)",   match: 3, prize: 3,       paid: true  }
        ],
        closingLevels: [
            { id: "close6", label: "Fechamento Sena (6)",   guarantee: 6, icon: "🎯" },
            { id: "close5", label: "Fechamento Quina (5)",  guarantee: 5, icon: "⭐" },
            { id: "close4", label: "Fechamento Quadra (4)", guarantee: 4, icon: "🔥" },
            { id: "close3", label: "Fechamento Terno (3)",  guarantee: 3, icon: "✅" }
        ],
        minBet: 6,
        maxBet: 50,
        statsCount: 15
    },
    lotomania: {
        name: "Lotomania",
        range: [0, 99],
        draw: 20,
        color: "#f07d00",
        colorGrad: "#9b5000",
        cols: 10,
        price: 3.00,
        // Faixas oficiais: 20, 19, 18, 17, 16, 15 acertos E 0 acertos (prêmio especial)
        strategies: [
            { id: "20pts",  label: "20 Pontos",  match: 20, prize: 5000000, paid: true  },
            { id: "19pts",  label: "19 Pontos",  match: 19, prize: 80000,   paid: true  },
            { id: "18pts",  label: "18 Pontos",  match: 18, prize: 3000,    paid: true  },
            { id: "17pts",  label: "17 Pontos",  match: 17, prize: 250,     paid: true  },
            { id: "16pts",  label: "16 Pontos",  match: 16, prize: 30,      paid: true  },
            { id: "15pts",  label: "15 Pontos",  match: 15, prize: 6,       paid: true  },
            { id: "0pts",   label: "0 Pontos (Mania de Milionário)", match: 0, prize: 250, paid: true }
        ],
        closingLevels: [
            { id: "close20", label: "Fechamento 20 Pontos",  guarantee: 20, icon: "🎯" },
            { id: "close19", label: "Fechamento 19 Pontos",  guarantee: 19, icon: "⭐" },
            { id: "close18", label: "Fechamento 18 Pontos",  guarantee: 18, icon: "🔥" },
            { id: "close17", label: "Fechamento 17 Pontos",  guarantee: 17, icon: "✅" }
        ],
        minBet: 50,
        maxBet: 100,
        maxFixed: 30,
        statsCount: 30,
        statsSortNumeric: true
    },
    timemania: {
        name: "Timemania",
        range: [1, 80],
        draw: 7,
        color: "#00a859",
        colorGrad: "#006638",
        cols: 10,
        price: 3.50,
        // Faixas oficiais: 7, 6, 5, 4, 3 acertos
        strategies: [
            { id: "7pts",  label: "7 Pontos (Timemania)",  match: 7, prize: 4000000, paid: true  },
            { id: "6pts",  label: "6 Pontos",               match: 6, prize: 30000,   paid: true  },
            { id: "5pts",  label: "5 Pontos",               match: 5, prize: 800,     paid: true  },
            { id: "4pts",  label: "4 Pontos",               match: 4, prize: 7,       paid: true  },
            { id: "3pts",  label: "3 Pontos",               match: 3, prize: 3,       paid: true  }
        ],
        closingLevels: [
            { id: "close7", label: "Fechamento 7 Pontos",  guarantee: 7, icon: "🎯" },
            { id: "close6", label: "Fechamento 6 Pontos",  guarantee: 6, icon: "⭐" },
            { id: "close5", label: "Fechamento 5 Pontos",  guarantee: 5, icon: "🔥" }
        ],
        minBet: 10,
        maxBet: 80,
        statsCount: 20
    },
    diadesorte: {
        name: "Dia de Sorte",
        range: [1, 31],
        draw: 7,
        color: "#e27820",
        colorGrad: "#8f4c0f",
        cols: 7,
        price: 3.00,
        // Faixas oficiais: 7, 6, 5, 4 acertos
        strategies: [
            { id: "7pts",  label: "7 Pontos (Dia de Sorte)",  match: 7, prize: 1000000, paid: true  },
            { id: "6pts",  label: "6 Pontos",                  match: 6, prize: 2500,    paid: true  },
            { id: "5pts",  label: "5 Pontos",                  match: 5, prize: 30,      paid: true  },
            { id: "4pts",  label: "4 Pontos",                  match: 4, prize: 4,       paid: true  }
        ],
        closingLevels: [
            { id: "close7", label: "Fechamento 7 Pontos",  guarantee: 7, icon: "🎯" },
            { id: "close6", label: "Fechamento 6 Pontos",  guarantee: 6, icon: "⭐" },
            { id: "close5", label: "Fechamento 5 Pontos",  guarantee: 5, icon: "🔥" }
        ],
        minBet: 7,
        maxBet: 31,
        statsCount: 15,
        drawDays: [2, 4, 6],
        drawTime: "20:00"
    }
};

// Add missing draw days to others
GAMES.megasena.drawDays = [2, 4, 6];
GAMES.megasena.drawTime = "20:00";
GAMES.megasena.estimatedPrizeFallback = 30000000;

GAMES.lotofacil.drawDays = [1, 2, 3, 4, 5, 6];
GAMES.lotofacil.drawTime = "20:00";
GAMES.lotofacil.estimatedPrizeFallback = 1700000;

GAMES.quina.drawDays = [1, 2, 3, 4, 5, 6];
GAMES.quina.drawTime = "20:00";
GAMES.quina.estimatedPrizeFallback = 6000000;

GAMES.duplasena.drawDays = [1, 3, 5];
GAMES.duplasena.drawTime = "20:00";
GAMES.duplasena.estimatedPrizeFallback = 2500000;

GAMES.lotomania.drawDays = [1, 3, 5];
GAMES.lotomania.drawTime = "20:00";
GAMES.lotomania.estimatedPrizeFallback = 4000000;

GAMES.timemania.drawDays = [2, 4, 6];
GAMES.timemania.drawTime = "20:00";
GAMES.timemania.estimatedPrizeFallback = 3500000;

GAMES.diadesorte.estimatedPrizeFallback = 1000000;
