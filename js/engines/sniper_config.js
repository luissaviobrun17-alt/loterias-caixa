// sniper_config.js – fornece configuração de pool padrão e presets para cada loteria
// Cada entrada contém: drawSize (mínimo), totalRange (número de bolas), defaultPresets
// Presets: { name, label, percentage } – porcentagem do range total que o pool deve ocupar

const SNIPER_CONFIG = {
  megasena: {
    drawSize: 6,
    totalRange: 60,
    presets: [
      { name: 'conservador', label: 'Conservador (70 % do range)', percentage: 0.70 },
      { name: 'equilibrado', label: 'Equilibrado (55 % do range)', percentage: 0.55 },
      { name: 'agressivo', label: 'Agressivo (40 % do range)', percentage: 0.40 }
    ]
  },
  quina: {
    drawSize: 5,
    totalRange: 80,
    presets: [
      { name: 'conservador', label: 'Conservador (70 % do range)', percentage: 0.70 },
      { name: 'equilibrado', label: 'Equilibrado (55 % do range)', percentage: 0.55 },
      { name: 'agressivo', label: 'Agressivo (40 % do range)', percentage: 0.40 }
    ]
  },
  lotofacil: {
    drawSize: 15,
    totalRange: 25,
    presets: [
      { name: 'conservador', label: 'Conservador (80 % do range)', percentage: 0.80 },
      { name: 'equilibrado', label: 'Equilibrado (65 % do range)', percentage: 0.65 },
      { name: 'agressivo', label: 'Agressivo (50 % do range)', percentage: 0.50 }
    ]
  },
  duplasena: {
    drawSize: 6,
    totalRange: 50,
    presets: [
      { name: 'conservador', label: 'Conservador (70 % do range)', percentage: 0.70 },
      { name: 'equilibrado', label: 'Equilibrado (55 % do range)', percentage: 0.55 },
      { name: 'agressivo', label: 'Agressivo (40 % do range)', percentage: 0.40 }
    ]
  },
  lotomania: {
    drawSize: 50,
    totalRange: 100,
    presets: [
      { name: 'conservador', label: 'Conservador (90 % do range)', percentage: 0.90 },
      { name: 'equilibrado', label: 'Equilibrado (80 % do range)', percentage: 0.80 },
      { name: 'agressivo', label: 'Agressivo (70 % do range)', percentage: 0.70 }
    ]
  },
  timemania: {
    drawSize: 10,
    totalRange: 80,
    presets: [
      { name: 'conservador', label: 'Conservador (70 % do range)', percentage: 0.70 },
      { name: 'equilibrado', label: 'Equilibrado (55 % do range)', percentage: 0.55 },
      { name: 'agressivo', label: 'Agressivo (40 % do range)', percentage: 0.40 }
    ]
  },
  diadesorte: {
    drawSize: 7,
    totalRange: 31,
    presets: [
      { name: 'conservador', label: 'Conservador (70 % do range)', percentage: 0.70 },
      { name: 'equilibrado', label: 'Equilibrado (55 % do range)', percentage: 0.55 },
      { name: 'agressivo', label: 'Agressivo (40 % do range)', percentage: 0.40 }
    ]
  },
  milionaria: {
    drawSize: 6,
    totalRange: 50,
    presets: [
      { name: 'conservador', label: 'Conservador (70 % do range)', percentage: 0.70 },
      { name: 'equilibrado', label: 'Equilibrado (55 % do range)', percentage: 0.55 },
      { name: 'agressivo', label: 'Agressivo (40 % do range)', percentage: 0.40 }
    ]
  },
  supersete: {
    drawSize: 7,
    totalRange: 10,
    presets: [
      { name: 'conservador', label: 'Conservador (70 % das colunas)', percentage: 0.70 },
      { name: 'equilibrado', label: 'Equilibrado (50 % das colunas)', percentage: 0.50 },
      { name: 'agressivo', label: 'Agressivo (30 % das colunas)', percentage: 0.30 }
    ]
  }
};

/**
 * Recupera a configuração de Sniper para a loteria atual.
 * @param {string} gameKey - chave da loteria (ex.: 'megasena').
 * @returns {object} objeto contendo drawSize, totalRange e presets.
 */
function getSniperConfig(gameKey) {
  const key = (gameKey || '').toLowerCase();
  return SNIPER_CONFIG[key] || null;
}

// Export para uso no browser (se módulo ES6 não suportado)
if (typeof window !== 'undefined') {
  window.SniperConfig = { getSniperConfig };
}
