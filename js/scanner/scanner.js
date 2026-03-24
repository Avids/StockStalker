async function scanMarket(preset = 'all', dataSource = 'demo', signal = null) {
  const watchlist = getWatchlist(preset);
  const results = [];
  let scanned = 0;
  let failed = 0;
  
  updateScanStatus('scanning', `Scanning ${watchlist.length} symbols...`);
  showLoadingOverlay(true, `Scanning market…`, `0/${watchlist.length}`);
  
  try {
    const batchSize = 10;
    for (let i = 0; i < watchlist.length; i += batchSize) {
      // Check if cancelled
      if (signal && signal.aborted) {
        throw new Error('Scan cancelled');
      }
      
      const batch = watchlist.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (symbol) => {
        // Check if cancelled
        if (signal && signal.aborted) {
          throw new Error('Scan cancelled');
        }
        
        try {
          const data = await fetchStockData(symbol, dataSource, signal);
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
          if (e.name === 'AbortError' || e.message === 'Scan cancelled') {
            throw e; // Re-throw to stop scanning
          }
          console.warn(`Failed to scan ${symbol}:`, e.message);
          failed++;
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(r => r !== null);
      results.push(...validResults);
      
      scanned += batch.length;
      updateLoadingProgress(scanned, watchlist.length, failed);
      
      if (dataSource !== 'demo' && i + batchSize < watchlist.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    results.sort((a, b) => b.score - a.score);
    
    updateScanStatus('complete', `Scan complete: ${results.length}/${watchlist.length} stocks`);
    showLoadingOverlay(false);
    
    return results;
  } catch (error) {
    if (error.name === 'AbortError' || error.message === 'Scan cancelled') {
      updateScanStatus('complete', 'Scan cancelled');
    } else {
      updateScanStatus('error', `Scan failed: ${error.message}`);
    }
    showLoadingOverlay(false);
    throw error;
  }
}

async function fetchStockData(symbol, dataSource, signal = null) {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), 
      dataSource === 'demo' ? 100 : 8000)
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
    // Use signal if provided for fetch abortion
    if (signal) {
      return await Promise.race([
        fetchData(),
        timeout,
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        })
      ]);
    }
    return await Promise.race([fetchData(), timeout]);
  } catch (error) {
    console.warn(`${symbol} fetch failed:`, error.message);
    return null;
  }
}
