// ── Signal Generation Engine ────────────────────────────────────────────

// Generate trade signals for multiple timeframes
function generateTradeSignals(priceData, historicalData = null) {
  const signals = {
    M5: generateSignal(priceData, 5, historicalData),
    M15: generateSignal(priceData, 15, historicalData),
    M30: generateSignal(priceData, 30, historicalData),
    H1: generateSignal(priceData, 60, historicalData),
    D1: generateSignal(priceData, 1440, historicalData)
  };
  return signals;
}

// Generate single timeframe signal
function generateSignal(priceData, timeframe, historicalData = null) {
  const change = parseFloat(priceData.priceChangePercent) || 0;
  const volume = priceData.volume || 0;
  const avgVolume = priceData.avgVolume || volume;
  const rvol = volume / avgVolume || 1;
  
  // Simple signal logic based on price action
  let signal = 'NEUTRAL';
  let strength = 0;
  
  if (change > 2) {
    signal = 'BULLISH';
    strength = Math.min(10, Math.floor(change * 2));
  } else if (change < -2) {
    signal = 'BEARISH';
    strength = Math.min(10, Math.floor(Math.abs(change) * 2));
  } else if (change > 0.5) {
    signal = 'SLIGHT_BULL';
    strength = 3;
  } else if (change < -0.5) {
    signal = 'SLIGHT_BEAR';
    strength = 3;
  }
  
  // Adjust for volume
  if (rvol > 2) strength = Math.min(10, strength + 2);
  if (rvol < 0.5) strength = Math.max(1, strength - 2);
  
  return {
    signal,
    strength,
    timeframe
  };
}

// Calculate relative strength ranking
function calculateRelativeStrength(ticker, priceData, allStocks) {
  if (!allStocks || allStocks.length === 0) return { M5: 5, M15: 5, M30: 5, H1: 5, D1: 5 };
  
  const change = parseFloat(priceData.priceChangePercent) || 0;
  const rank = allStocks.filter(s => {
    const sChange = parseFloat(s.priceChangePercent) || 0;
    return sChange > change;
  }).length;
  
  const percentile = 10 - Math.floor((rank / allStocks.length) * 10);
  
  return {
    M5: percentile,
    M15: percentile,
    M30: percentile,
    H1: percentile,
    D1: percentile
  };
}

// Calculate relative volume
function calculateRelativeVolume(priceData) {
  const volume = priceData.volume || 0;
  const avgVolume = priceData.avgVolume || volume;
  const rvol = volume / avgVolume || 1;
  
  return {
    M15: Math.min(10, Math.round(rvol * 2)),
    M30: Math.min(10, Math.round(rvol * 2)),
    H1: Math.min(10, Math.round(rvol * 2)),
    D1: Math.min(10, Math.round(rvol * 2)),
    AVG: Math.min(10, Math.round(rvol * 2))
  };
}

// Calculate overall score
function calculateScore(tradeSignals, relativeStrength, relativeVolume, priceData) {
  const change = Math.abs(parseFloat(priceData.priceChangePercent) || 0);
  const rvol = (relativeVolume.AVG || 1);
  
  // Score components
  const momentumScore = Math.min(10, change * 2);
  const volumeScore = Math.min(10, rvol);
  const signalScore = Object.values(tradeSignals).reduce((sum, s) => sum + s.strength, 0) / 5;
  const strengthScore = Object.values(relativeStrength).reduce((sum, r) => sum + r, 0) / 5;
  
  // Weighted average
  const score = (momentumScore * 0.3 + volumeScore * 0.2 + signalScore * 0.3 + strengthScore * 0.2);
  
  return Math.round(score * 10) / 10;
}

// Format signal for display
function formatSignal(signalObj) {
  if (!signalObj) return '<span class="signal-neutral">—</span>';
  
  const icons = {
    'BULLISH': '🟢',
    'SLIGHT_BULL': '🟢',
    'NEUTRAL': '⚪',
    'SLIGHT_BEAR': '🔴',
    'BEARISH': '🔴'
  };
  
  const colors = {
    'BULLISH': 'signal-bullish',
    'SLIGHT_BULL': 'signal-bullish',
    'NEUTRAL': 'signal-neutral',
    'SLIGHT_BEAR': 'signal-bearish',
    'BEARISH': 'signal-bearish'
  };
  
  const icon = icons[signalObj.signal] || '⚪';
  const colorClass = colors[signalObj.signal] || 'signal-neutral';
  
  return `<span class="${colorClass}">${icon} ${signalObj.strength}</span>`;
}

// Export for use in other modules
window.SignalEngine = {
  generateTradeSignals,
  calculateRelativeStrength,
  calculateRelativeVolume,
  calculateScore,
  formatSignal
};
