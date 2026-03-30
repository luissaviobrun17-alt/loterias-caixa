
// js/engines/games.js
const GAMES = {
    megasena: {
        name: "Mega Sena",
        range: [1, 60],
        draw: 6,
        color: "#209A3C",
        colorGrad: "#0d6b28",
        cols: 10,
        price: 6.00,
        strategies: [
            { id: "sena", label: "Sena (6)", match: 6, prize: 60000000 },
            { id: "quina", label: "Quina (5)", match: 5, prize: 50000 },
            { id: "quadra", label: "Quadra (4)", match: 4, prize: 1200 },
            { id: "terno", label: "Terno (3)", match: 3, prize: 0 }
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
        strategies: [
            { id: "15pts", label: "15 Pontos", match: 15, prize: 2000000 },
            { id: "14pts", label: "14 Pontos", match: 14, prize: 1800 },
            { id: "13pts", label: "13 Pontos", match: 13, prize: 30 },
            { id: "12pts", label: "12 Pontos", match: 12, prize: 0 },
            { id: "11pts", label: "11 Pontos", match: 11, prize: 0 }
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
        strategies: [
            { id: "quina", label: "Quina (5)", match: 5, prize: 6000000 },
            { id: "quadra", label: "Quadra (4)", match: 4, prize: 6000 },
            { id: "terno", label: "Terno (3)", match: 3, prize: 150 }
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
        strategies: [
            { id: "sena", label: "Sena (6)", match: 6, prize: 200000 },
            { id: "quina", label: "Quina (5)", match: 5, prize: 4000 },
            { id: "quadra", label: "Quadra (4)", match: 4, prize: 100 }
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
        strategies: [
            { id: "20pts", label: "20 Pontos", match: 20, prize: 5000000 },
            { id: "19pts", label: "19 Pontos", match: 19, prize: 60000 },
            { id: "18pts", label: "18 Pontos", match: 18, prize: 2500 },
            { id: "17pts", label: "17 Pontos", match: 17, prize: 200 }
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
        strategies: [
            { id: "7pts", label: "7 Pontos", match: 7, prize: 4000000 },
            { id: "6pts", label: "6 Pontos", match: 6, prize: 30000 },
            { id: "5pts", label: "5 Pontos", match: 5, prize: 800 }
        ],
        minBet: 10,
        maxBet: 10,
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
        strategies: [
            { id: "7pts", label: "7 Pontos", match: 7, prize: 1000000 },
            { id: "6pts", label: "6 Pontos", match: 6, prize: 2000 },
            { id: "5pts", label: "5 Pontos", match: 5, prize: 25 }
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
