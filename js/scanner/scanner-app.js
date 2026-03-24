// Add at the top with other variables
let scanAbortController = null;
let isScanning = false;

// Update runScan function
async function runScan() {
  const readyMsg = document.getElementById('readyMessage');
  const resultsContainer = document.getElementById('resultsContainer');
  
  // Prevent multiple scans
  if (isScanning) {
    alert('Scan already in progress');
    return;
  }
  
  // Check if API keys are configured for real data
  if (currentDataSource !== 'demo') {
    const apiKeys = JSON.parse(localStorage.getItem('stockAnalyzerApiKeys') || '{}');
    const hasFinnhub = !!apiKeys.finnhub;
    const hasAlphaVantage = !!apiKeys.alphaVantage;
    const hasMassive = !!apiKeys.massive;
    
    if (!hasFinnhub && !hasAlphaVantage && !hasMassive && currentDataSource === 'yahoo') {
      const useDemo = confirm(
        '⚠ No API keys configured!\n\n' +
        'Would you like to:\n' +
        '• Click OK for DEMO MODE (instant results)\n' +
        '• Click Cancel to configure APIs first\n\n' +
        'APIs needed: Finnhub, Alpha Vantage, or Massive'
      );
      
      if (useDemo) {
        currentDataSource = 'demo';
        const dataSourceSelect = document.getElementById('dataSource');
        if (dataSourceSelect) dataSourceSelect.value = 'demo';
      } else {
        window.location.href = 'index.html';
        return;
      }
    }
  }
  
  if (readyMsg) readyMsg.classList.add('hidden');
  if (resultsContainer) resultsContainer.classList.remove('hidden');
  
  try {
    isScanning = true;
    scanAbortController = new AbortController();
    scanResults = await window.MarketScanner.scanMarket(currentPreset, currentDataSource, scanAbortController.signal);
    renderResults(scanResults);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Scan cancelled by user');
      window.MarketScanner.updateScanStatus('complete', 'Scan cancelled');
    } else {
      console.error('Scan failed:', error);
      alert('Scan failed: ' + error.message + '\n\nTry DEMO MODE instead!');
    }
  } finally {
    isScanning = false;
    scanAbortController = null;
  }
}

// Add cancel function
function cancelScan() {
  if (scanAbortController) {
    scanAbortController.abort();
  }
  isScanning = false;
  window.MarketScanner.showLoadingOverlay(false);
  window.MarketScanner.updateScanStatus('complete', 'Scan cancelled');
  
  // Re-enable scan button
  const scanBtn = document.getElementById('scanMarketBtn');
  if (scanBtn) scanBtn.disabled = false;
}

// Update setupScannerControls function
function setupScannerControls() {
  const scanBtn = document.getElementById('scanMarketBtn');
  const demoBtn = document.getElementById('demoModeBtn');
  const autoBtn = document.getElementById('autoScanBtn');
  const cancelBtn = document.getElementById('cancelScanBtn');  // Add this
  const presetBtns = document.querySelectorAll('.preset-btn');
  const filterSelect = document.getElementById('filterSelect');
  const sortBtns = document.querySelectorAll('.sort-btn');
  
  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', cancelScan);
  }
  
  // ... rest of existing code ...
}
// ── Stock Stalker App Initialization ───────────────────────────────────

let autoScanInterval = null;
let currentPreset = 'all';
let currentDataSource = 'demo';
let scanResults = [];
let scanAbortController = null;

// Add this function
function cancelScan() {
  if (scanAbortController) {
    scanAbortController.abort();
    scanAbortController = null;
  }
  window.MarketScanner.showLoadingOverlay(false);
  window.MarketScanner.updateScanStatus('complete', 'Scan cancelled');
}

// Add event listener in setupScannerControls()
const cancelBtn = document.getElementById('cancelScanBtn');
if (cancelBtn) {
  cancelBtn.addEventListener('click', cancelScan);
}

// Clock update
function updateClock() {
  const clock = document.getElementById('clockDisplay');
  if (clock) {
    clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  }
}

// Initialize scanner controls
function setupScannerControls() {
  const scanBtn = document.getElementById('scanMarketBtn');
  const demoBtn = document.getElementById('demoModeBtn');
  const autoBtn = document.getElementById('autoScanBtn');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const filterSelect = document.getElementById('filterSelect');
  const sortBtns = document.querySelectorAll('.sort-btn');
  
  // Scan market button
  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      currentDataSource = 'yahoo';
      runScan();
    });
  }
  
  // Demo mode button
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      currentDataSource = 'demo';
      runScan();
    });
  }
  
  // Auto scan toggle
  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      autoBtn.classList.toggle('active');
      if (autoBtn.classList.contains('active')) {
        startAutoScan();
      } else {
        stopAutoScan();
      }
    });
  }
  
  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPreset = btn.dataset.preset;
      window.WatchlistManager.updateWatchlistDisplay(currentPreset);
    });
  });
  
  // Filter select
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      filterResults(filterSelect.value);
    });
  }
  
  // Sort buttons
  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sortResults(btn.dataset.sort);
    });
  });
}

// Run market scan
async function runScan() {
  const readyMsg = document.getElementById('readyMessage');
  const resultsContainer = document.getElementById('resultsContainer');
  
  // Check if API keys are configured for real data
  if (currentDataSource !== 'demo') {
    const apiKeys = JSON.parse(localStorage.getItem('stockAnalyzerApiKeys') || '{}');
    const hasFinnhub = !!apiKeys.finnhub;
    const hasAlphaVantage = !!apiKeys.alphaVantage;
    const hasMassive = !!apiKeys.massive;
    
    if (!hasFinnhub && !hasAlphaVantage && !hasMassive && currentDataSource === 'yahoo') {
      // No APIs configured - switch to demo mode automatically
      const useDemo = confirm(
        '⚠ No API keys configured!\n\n' +
        'Would you like to:\n' +
        '• Click OK for DEMO MODE (instant results)\n' +
        '• Click Cancel to configure APIs first\n\n' +
        'APIs needed: Finnhub, Alpha Vantage, or Massive'
      );
      
      if (useDemo) {
        currentDataSource = 'demo';
        document.getElementById('dataSource').value = 'demo';
      } else {
        // Open settings
        window.location.href = 'index.html';
        return;
      }
    }
  }
  
  if (readyMsg) readyMsg.classList.add('hidden');
  if (resultsContainer) resultsContainer.classList.remove('hidden');
  
  try {
    scanResults = await window.MarketScanner.scanMarket(currentPreset, currentDataSource);
    renderResults(scanResults);
  } catch (error) {
    console.error('Scan failed:', error);
    alert('Scan failed: ' + error.message + '\n\nTry DEMO MODE instead!');
  }
}

// Render results table
function renderResults(results) {
  const tbody = document.getElementById('resultsBody');
  const countEl = document.getElementById('resultsCount');
  
  if (!tbody) return;
  if (countEl) countEl.textContent = `${results.length} stocks scanned`;
  
  if (results.length === 0) {
    tbody.innerHTML = '<tr class="placeholder-row"><td colspan="20">No results found</td></tr>';
    return;
  }
  
  tbody.innerHTML = results.map((stock, index) => `
    <tr>
      <td>${index + 1}</td>
      <td class="symbol-cell">${stock.symbol}</td>
      <td class="price-cell">${stock.currentPrice?.toFixed(2) || 'N/A'}</td>
      <td class="${parseFloat(stock.priceChangePercent) >= 0 ? 'change-positive' : 'change-negative'}">
        ${parseFloat(stock.priceChangePercent) >= 0 ? '+' : ''}${stock.priceChangePercent}%
      </td>
      <td>${window.SignalEngine.formatSignal(stock.signals?.M5)}</td>
      <td>${window.SignalEngine.formatSignal(stock.signals?.M15)}</td>
      <td>${window.SignalEngine.formatSignal(stock.signals?.M30)}</td>
      <td>${window.SignalEngine.formatSignal(stock.signals?.H1)}</td>
      <td>${window.SignalEngine.formatSignal(stock.signals?.D1)}</td>
      <td>${stock.relStrength?.M5 || 5}</td>
      <td>${stock.relStrength?.M15 || 5}</td>
      <td>${stock.relStrength?.M30 || 5}</td>
      <td>${stock.relStrength?.H1 || 5}</td>
      <td>${stock.relStrength?.D1 || 5}</td>
      <td>${stock.relVolume?.M15 || 1}</td>
      <td>${stock.relVolume?.M30 || 1}</td>
      <td>${stock.relVolume?.H1 || 1}</td>
      <td>${stock.relVolume?.D1 || 1}</td>
      <td>${stock.relVolume?.AVG || 1}</td>
      <td class="score-cell ${getScoreClass(stock.score)}">${stock.score}</td>
    </tr>
  `).join('');
}

function getScoreClass(score) {
  if (score >= 7) return 'score-high';
  if (score >= 4) return 'score-medium';
  return 'score-low';
}

// Filter results
function filterResults(filter) {
  let filtered = [...scanResults];
  
  switch (filter) {
    case 'top':
      filtered = filtered.filter(s => s.score >= 7);
      break;
    case 'bullish':
      filtered = filtered.filter(s => parseFloat(s.priceChangePercent) > 0);
      break;
    case 'bearish':
      filtered = filtered.filter(s => parseFloat(s.priceChangePercent) < 0);
      break;
    case 'redvol':
      filtered = filtered.filter(s => (s.relVolume?.AVG || 0) >= 4);
      break;
  }
  
  renderResults(filtered);
}

// Sort results
function sortResults(sortBy) {
  let sorted = [...scanResults];
  
  switch (sortBy) {
    case 'score':
      sorted.sort((a, b) => b.score - a.score);
      break;
    case 'rvol':
      sorted.sort((a, b) => (b.relVolume?.AVG || 0) - (a.relVolume?.AVG || 0));
      break;
    case 'change':
      sorted.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
      break;
    case 'alpha':
      sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
      break;
  }
  
  renderResults(sorted);
}

// Auto scan
function startAutoScan() {
  const interval = document.getElementById('autoScanInterval')?.value || 300000;
  autoScanInterval = setInterval(() => {
    runScan();
  }, parseInt(interval));
  console.log('Auto-scan started');
}

function stopAutoScan() {
  if (autoScanInterval) {
    clearInterval(autoScanInterval);
    autoScanInterval = null;
    console.log('Auto-scan stopped');
  }
}

// Settings panel
function setupSettingsPanel() {
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsClose = document.getElementById('settingsClose');
  const saveBtn = document.getElementById('saveScannerSettings');
  const openApiBtn = document.getElementById('openApiSettings');
  
  if (settingsToggle) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel?.classList.toggle('hidden');
    });
  }
  
  if (settingsClose) {
    settingsClose.addEventListener('click', () => {
      settingsPanel?.classList.add('hidden');
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const minScore = document.getElementById('minScore')?.value || 4;
      const dataSource = document.getElementById('dataSource')?.value || 'demo';
      
      currentDataSource = dataSource;
      localStorage.setItem('scannerSettings', JSON.stringify({ minScore, dataSource }));
      
      settingsPanel?.classList.add('hidden');
      alert('Settings saved!');
    });
  }
  
  if (openApiBtn) {
    openApiBtn.addEventListener('click', () => {
      // Open StageValuator API settings
      window.location.href = 'index.html';
    });
  }
}

// Load saved settings
function loadScannerSettings() {
  const saved = localStorage.getItem('scannerSettings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.minScore && document.getElementById('minScore')) {
        document.getElementById('minScore').value = settings.minScore;
      }
      if (settings.dataSource && document.getElementById('dataSource')) {
        document.getElementById('dataSource').value = settings.dataSource;
        currentDataSource = settings.dataSource;
      }
    } catch (e) {
      console.error('Failed to load scanner settings:', e);
    }
  }
}

// Initialize app
function init() {
  updateClock();
  setInterval(updateClock, 1000);
  
  loadScannerSettings();
  window.WatchlistManager.updateWatchlistDisplay('all');
  setupScannerControls();
  setupSettingsPanel();
  
  // Check API keys on load
  checkApiKeys();
  
  console.log('🎯 Stock Stalker Pro initialized');
}

function checkApiKeys() {
  const apiKeys = JSON.parse(localStorage.getItem('stockAnalyzerApiKeys') || '{}');
  const hasAnyApi = !!apiKeys.finnhub || !!apiKeys.alphaVantage || !!apiKeys.massive;
  
  if (!hasAnyApi) {
    // Show notification
    setTimeout(() => {
      const msg = document.getElementById('readyMessage');
      if (msg) {
        msg.innerHTML = `
          <span class="ready-icon">⚠</span>
          <div>
            <strong>No API Keys Configured</strong><br>
            Click <strong>⚙ SETTINGS</strong> to configure APIs, or use <strong>▶ DEMO MODE</strong> for instant results.
          </div>
        `;
      }
    }, 1000);
  }
}
