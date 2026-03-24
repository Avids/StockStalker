// ── Market Scanner ─────────────────────────────────────────────────────

async function scanMarket(preset = 'all', dataSource = 'demo') {
  const watchlist = getWatchlist(preset);
  const results = [];
  let scanned = 0;
  let failed = 0;
  
  // Update UI
  updateScanStatus('scanning', `Scanning ${watchlist.length} symbols...`);
  showLoadingOverlay(true, `Scanning market…`, `0/${watchlist.length}`);
  
  try {
    // Process in batches to avoid overwhelming APIs
    const batchSize = 10;
    for (let i = 0; i < watchlist.length; i += batchSize) {
      const batch = watchlist.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (symbol) => {
        try {
          const data = await fetchStockData(symbol, dataSource);
          if (data) {
            const signals = window.SignalEngine.generateTradeSignals(data);
            const relStrength = window.SignalEngine.calculateRelativeStrength(symbol, data, results);
            const relVolume = window.SignalEngine.calculateRelativeVolume(data);
            const score = window.SignalEngine.calculateScore(signals, relStrength, relVolume, data);
            
            return {
              symbol,
              ...data,
              signals,
              relStrength,
              relVolume,
              score
            };
          }
        } catch (e) {
          console.warn(`Failed to scan ${symbol}:`, e.message);
          failed++;
          return null;
        }
      });
      
      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(r => r !== null);
      results.push(...validResults);
      
      scanned += batch.length;
      updateLoadingProgress(scanned, watchlist.length, failed);
      
      // Small delay between batches to avoid rate limiting
      if (dataSource !== 'demo' && i + batchSize < watchlist.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Sort by score
    results.sort((a, b) => b.score - a.score);
    
    updateScanStatus('complete', `Scan complete: ${results.length}/${watchlist.length} stocks`);
    showLoadingOverlay(false);
    
    return results;
  } catch (error) {
    updateScanStatus('error', `Scan failed: ${error.message}`);
    showLoadingOverlay(false);
    throw error;
  }
}

async function fetchStockData(symbol, dataSource) {
  // Add timeout to prevent hanging
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout - try DEMO MODE')), 
      dataSource === 'demo' ? 100 : 8000)  // 8 second timeout for real APIs
  );
  
  const fetchData = async () => {
    switch (dataSource) {
      case 'demo':
        return generateDemoData(symbol);
      case 'yahoo':
        try {
          return await fetchYahooFinance(symbol);
        } catch (e) {
          console.warn(`Yahoo failed for ${symbol}:`, e.message);
          // Yahoo often fails without proper CORS - fallback to demo data
          return generateDemoData(symbol);
        }
      case 'finnhub':
        return await fetchFinnhubQuote(symbol);
      case 'massive':
        return await fetchMassiveQuote(symbol);
      default:
        return generateDemoData(symbol);
    }
  };
  
  try {
    return await Promise.race([fetchData(), timeout]);
  } catch (error) {
    console.warn(`${symbol} fetch failed:`, error.message);
    return null;
  }
}
  
  try {
    return await Promise.race([fetchData(), timeout]);
  } catch (error) {
    console.warn(`${symbol} fetch failed:`, error.message);
    return null;
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

function updateLoadingProgress(current, total, failed = 0) {
  const progress = document.getElementById('loadingProgress');
  if (progress) {
    const failedText = failed > 0 ? ` (${failed} failed)` : '';
    progress.textContent = `${current}/${total}${failedText}`;
  }
}

// Export for use in other modules
window.MarketScanner = {
  scanMarket,
  fetchStockData,
  updateScanStatus,
  showLoadingOverlay
};
