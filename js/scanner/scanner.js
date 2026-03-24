// ── Market Scanner ─────────────────────────────────────────────────────

async function scanMarket(preset = 'all', dataSource = 'demo') {
  const watchlist = getWatchlist(preset);
  const results = [];
  let scanned = 0;
  
  // Update UI
  updateScanStatus('scanning', `Scanning ${watchlist.length} symbols...`);
  showLoadingOverlay(true, `Scanning market…`, `0/${watchlist.length}`);
  
  try {
    // Scan each symbol
    for (const symbol of watchlist) {
      try {
        const data = await fetchStockData(symbol, dataSource);
        if (data) {
          const signals = window.SignalEngine.generateTradeSignals(data);
          const relStrength = window.SignalEngine.calculateRelativeStrength(symbol, data, results);
          const relVolume = window.SignalEngine.calculateRelativeVolume(data);
          const score = window.SignalEngine.calculateScore(signals, relStrength, relVolume, data);
          
          results.push({
            symbol,
            ...data,
            signals,
            relStrength,
            relVolume,
            score
          });
        }
      } catch (e) {
        console.warn(`Failed to scan ${symbol}:`, e.message);
      }
      
      scanned++;
      updateLoadingProgress(scanned, watchlist.length);
      
      // Small delay to avoid rate limiting
      if (dataSource !== 'demo') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    updateScanStatus('complete', `Scan complete: ${results.length} stocks`);
    showLoadingOverlay(false);
    
    return results;
  } catch (error) {
    updateScanStatus('error', 'Scan failed');
    showLoadingOverlay(false);
    throw error;
  }
}

async function fetchStockData(symbol, dataSource) {
  switch (dataSource) {
    case 'demo':
      return generateDemoData(symbol);
    case 'yahoo':
      return await fetchYahooFinance(symbol);
    case 'finnhub':
      return await fetchFinnhubQuote(symbol);
    case 'massive':
      return await fetchMassiveQuote(symbol);
    default:
      return generateDemoData(symbol);
  }
}

function generateDemoData(symbol) {
  const basePrice = Math.random() * 500 + 50;
  const changePercent = (Math.random() - 0.5) * 10;
  const change = basePrice * (changePercent / 100);
  
  return {
    symbol,
    currentPrice: parseFloat(basePrice.toFixed(2)),
    priceChangePercent: changePercent.toFixed(2),
    priceChange: change.toFixed(2),
    volume: Math.floor(Math.random() * 10000000 + 1000000),
    avgVolume: Math.floor(Math.random() * 10000000 + 1000000),
    weekHigh52: (basePrice * 1.3).toFixed(2),
    weekLow52: (basePrice * 0.7).toFixed(2),
    marketCap: (basePrice * Math.random() * 1000000000).toFixed(0),
    exchange: ['NYSE', 'NASDAQ', 'AMEX'][Math.floor(Math.random() * 3)]
  };
}

function updateScanStatus(status, text) {
  const el = document.getElementById('scanStatus');
  if (!el) return;
  
  el.className = 'status-indicator ' + status;
  el.innerHTML = `<span class="status-dot">●</span><span>${text}</span>`;
}

function showLoadingOverlay(show, text = '', progress = '') {
  const overlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');
  const loadingProgress = document.getElementById('loadingProgress');
  
  if (!overlay) return;
  
  if (show) {
    if (loadingText) loadingText.textContent = text;
    if (loadingProgress) loadingProgress.textContent = progress;
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

function updateLoadingProgress(current, total) {
  const progress = document.getElementById('loadingProgress');
  if (progress) {
    progress.textContent = `${current}/${total}`;
  }
}

// Export for use in other modules
window.MarketScanner = {
  scanMarket,
  fetchStockData,
  updateScanStatus,
  showLoadingOverlay
};
