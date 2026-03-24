// ── Watchlist Management ─────────────────────────────────────────────────

const WATCHLISTS = {
  megacap: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JNJ'],
  tech: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'TSLA', 'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'NFLX'],
  finance: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'BLK', 'SCHW', 'USB'],
  health: ['JNJ', 'UNH', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY', 'LLY'],
  energy: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL'],
  sector: ['SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE'],
  dow: ['AAPL', 'MSFT', 'JPM', 'V', 'JNJ', 'UNH', 'HD', 'PG', 'CVX', 'MRK', 'KO', 'MCD', 'DIS', 'CAT', 'CRM', 'VZ', 'NKE', 'GS', 'AMGN', 'HON', 'IBM', 'BA', 'TRV', 'AXP', 'WMT', 'MMM', 'INTC', 'DOW'],
  all: ['SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XBI', 'XRT', 'XHB', 'SMH', 'SOXX', 'IBB', 'GLD', 'SLV', 'USO', 'TLT', 'IEF', 'HYG', 'LQD', 'EFA', 'EEM', 'FXI', 'EWJ', 'EWZ', 'GDX', 'ARKK', 'VXX',
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JNJ', 'WMT', 'JPM', 'UNH', 'PG', 'HD', 'MA', 'CVX', 'MRK', 'ABBV', 'PEP', 'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'CSCO', 'ACN', 'ABT', 'LLY', 'NKE', 'DHR', 'TXN', 'NEE', 'PM', 'UNP', 'RTX', 'QCOM', 'HON', 'UPS', 'LOW', 'ORCL', 'AMD', 'INTC', 'IBM', 'BA', 'CAT', 'GE', 'DE', 'SPGI', 'BLK', 'GS', 'AXP', 'SCHW', 'MS', 'C', 'WFC', 'USB', 'PNC', 'TFC', 'COF', 'BK', 'STT', 'NTRS', 'RF', 'KEY', 'FITB', 'HBAN', 'CFG', 'MTB', 'ZION', 'CMA', 'FRC', 'SIVB', 'PACW', 'WAL', 'EWBC', 'SBNY', 'FHN', 'ONB', 'UBSI', 'SNV', 'BOKF', 'OZK', 'UMBF', 'FULT', 'PBCT', 'CBSH', 'ASB', 'BPOP', 'OFG', 'GBCI', 'TCBI', 'IBOC', 'FFIN', 'BANR', 'CATY', 'WAFD', 'SFNC', 'HOPE', 'TBBK', 'CASH', 'BMRC', 'NRIM', 'LBAI', 'PFBC', 'CCBG', 'TRMK', 'FMBI', 'FBNC', 'SBCF', 'EGBN', 'HAFC', 'LKFN', 'WSFS', 'BRKL', 'FMAO', 'NBTB', 'UVSP', 'SBSI', 'CBFV', 'MBWM', 'PFIS', 'OCFC', 'HWBK', 'BCBP', 'FFBC', 'FSBW', 'CZWI', 'ESSA', 'HIFS', 'BSRR', 'FRME', 'INDB', 'WABC', 'CCBG', 'TOWN', 'BHB', 'FLIC', 'SRCE', 'FFWM', 'HOMB', 'NFBK', 'FISI', 'BANC', 'PACW', 'SBBP', 'CVBF', 'CZFS', 'WVFC', 'FDBC', 'RBKB', 'MYFW', 'LION', 'SMBK', 'CCXI', 'TCBK', 'EFSC', 'FULT', 'HTLF', 'NWBI', 'FBMS', 'FRBA', 'GSBC', 'BUSE', 'FMAO', 'PFBC', 'WRLD', 'CASH', 'BMRC', 'NRIM', 'LBAI', 'PFBC', 'CCBG', 'TRMK', 'FMBI', 'FBNC', 'SBCF', 'EGBN', 'HAFC', 'LKFN', 'WSFS', 'BRKL', 'FMAO', 'NBTB', 'UVSP', 'SBSI', 'CBFV', 'MBWM', 'PFIS', 'OCFC', 'HWBK', 'BCBP', 'FFBC', 'FSBW', 'CZWI', 'ESSA', 'HIFS', 'BSRR', 'FRME', 'INDB', 'WABC']
};

function getWatchlist(preset = 'all') {
  return WATCHLISTS[preset] || WATCHLISTS.all;
}

function getWatchlistInfo(preset = 'all') {
  const list = getWatchlist(preset);
  return {
    preset: preset,
    count: list.length,
    symbols: list
  };
}

function updateWatchlistDisplay(preset = 'all') {
  const display = document.getElementById('watchlistDisplay');
  if (!display) return;
  
  const info = getWatchlistInfo(preset);
  const preview = info.symbols.slice(0, 10).join(', ') + (info.count > 10 ? `, ... (${info.count} total)` : '');
  
  display.textContent = `Watchlist: ${preview}`;
}

// Export for use in other modules
window.WatchlistManager = {
  getWatchlist,
  getWatchlistInfo,
  updateWatchlistDisplay,
  WATCHLISTS
};
