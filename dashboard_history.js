// =============================================
// HISTORIC DASHBOARD — dashboard_history.js
// =============================================

// ---- State ----
let allData = [];
let filteredData = [];
let currentPage = 1;
const PAGE_SIZE = 15;
let sortKey = 'timestamp';
let sortDir = -1;
let lineChart, lineChart2, barChart, pieChart;
let activeDays = 7;

// =============================================
// DATA FETCHING
// =============================================
async function loadHistoricData(from, to) {
    try {
        const res = await fetch(`get_historic_data.php?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allData = await res.json();
        if (allData.error) throw new Error(allData.error);
        processData();
    } catch (e) {
        console.error('Failed to load data:', e);
        const banner = document.getElementById('errorBanner');
        banner.style.display = 'flex';
        banner.textContent = '⚠ Could not load data: ' + e.message;
    }
}

// =============================================
// PROCESS + RENDER
// =============================================
function processData() {
    if (!allData.length) return;
    document.getElementById('errorBanner').style.display = 'none';

    const temps     = allData.map(d => d.temperature);
    const hums      = allData.map(d => d.humidity);
    const pressures = allData.map(d => d.pressure).filter(v => v !== null && !isNaN(v));
    const altitudes = allData.map(d => d.altitude).filter(v => v !== null && !isNaN(v));

    const avg = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    const highAlerts = temps.filter(t => t > 30).length;

    document.getElementById('avgTemp').textContent        = avg(temps) + '°';
    document.getElementById('avgTempRange').textContent   = `min ${Math.min(...temps).toFixed(1)}° / max ${Math.max(...temps).toFixed(1)}°`;
    document.getElementById('avgHum').textContent         = avg(hums) + '%';
    document.getElementById('avgHumRange').textContent    = `min ${Math.min(...hums).toFixed(1)}% / max ${Math.max(...hums).toFixed(1)}%`;
    document.getElementById('totalReadings').textContent  = allData.length.toLocaleString();
    document.getElementById('readingSpan').textContent    = allData[0].timestamp.slice(0, 10) + ' → ' + allData[allData.length - 1].timestamp.slice(0, 10);
    document.getElementById('highAlerts').textContent     = highAlerts;
    document.getElementById('alertPct').textContent       = ((highAlerts / allData.length) * 100).toFixed(1) + '% of readings';

    if (pressures.length) {
        document.getElementById('avgPressure').textContent      = avg(pressures);
        document.getElementById('avgPressureRange').textContent = `${Math.min(...pressures).toFixed(1)} / ${Math.max(...pressures).toFixed(1)} hPa`;
    }
    if (altitudes.length) {
        document.getElementById('avgAltitude').textContent      = avg(altitudes) + 'm';
        document.getElementById('avgAltitudeRange').textContent = `${Math.min(...altitudes).toFixed(1)} / ${Math.max(...altitudes).toFixed(1)} m`;
    }

    renderLineChart();
    renderPressureChart();
    renderBarChart(temps);
    renderPieChart(hums);

    filteredData = [...allData];
    currentPage = 1;
    renderTable();
}

// =============================================
// CHARTS
// =============================================
function renderLineChart() {
    const step    = Math.max(1, Math.floor(allData.length / 100));
    const sampled = allData.filter((_, i) => i % step === 0);
    const labels  = sampled.map(d => d.timestamp.slice(5, 16).replace('T', ' '));
    const temps   = sampled.map(d => d.temperature);
    const hums    = sampled.map(d => d.humidity);

    if (lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById('histLineChart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Temp (°C)', data: temps, borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.08)',  tension: 0.3, pointRadius: 0, fill: true },
                { label: 'Hum (%)',   data: hums,  borderColor: '#3498db', backgroundColor: 'rgba(52,152,219,0.08)', tension: 0.3, pointRadius: 0, fill: true }
            ]
        },
        options: {
            animation: { duration: 600 },
            plugins: { legend: { labels: { color: '#6b6b88', font: { family: 'Rajdhani', size: 12 } } } },
            scales: {
                x: { ticks: { color: '#6b6b88', maxTicksLimit: 10, font: { family: 'Share Tech Mono', size: 10 } }, grid: { color: '#1e1e2a' } },
                y: { ticks: { color: '#6b6b88', font: { family: 'Share Tech Mono', size: 10 } },                   grid: { color: '#1e1e2a' } }
            }
        }
    });
}

function renderPressureChart() {
    const step     = Math.max(1, Math.floor(allData.length / 100));
    const sampled  = allData.filter((_, i) => i % step === 0);
    const labels   = sampled.map(d => d.timestamp.slice(5, 16).replace('T', ' '));
    const pressures = sampled.map(d => d.pressure);
    const altitudes = sampled.map(d => d.altitude);

    if (lineChart2) lineChart2.destroy();
    lineChart2 = new Chart(document.getElementById('histLineChart2').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Pressure (hPa)', data: pressures, borderColor: '#9b59b6', backgroundColor: 'rgba(155,89,182,0.08)', tension: 0.3, pointRadius: 0, fill: true, yAxisID: 'yP' },
                { label: 'Altitude (m)',   data: altitudes, borderColor: '#1abc9c', backgroundColor: 'rgba(26,188,156,0.08)', tension: 0.3, pointRadius: 0, fill: true, yAxisID: 'yA' }
            ]
        },
        options: {
            animation: { duration: 600 },
            plugins: { legend: { labels: { color: '#6b6b88', font: { family: 'Rajdhani', size: 12 } } } },
            scales: {
                x:  { ticks: { color: '#6b6b88', maxTicksLimit: 10, font: { family: 'Share Tech Mono', size: 10 } }, grid: { color: '#1e1e2a' } },
                yP: { position: 'left',  ticks: { color: '#9b59b6', font: { family: 'Share Tech Mono', size: 10 } }, grid: { color: '#1e1e2a' } },
                yA: { position: 'right', ticks: { color: '#1abc9c', font: { family: 'Share Tech Mono', size: 10 } }, grid: { display: false } }
            }
        }
    });
}

function renderBarChart(temps) {
    const bins   = [0, 0, 0, 0, 0, 0, 0];
    const ranges = ['<10', '10–15', '15–20', '20–25', '25–30', '30–35', '>35'];
    temps.forEach(t => {
        if      (t < 10) bins[0]++;
        else if (t < 15) bins[1]++;
        else if (t < 20) bins[2]++;
        else if (t < 25) bins[3]++;
        else if (t < 30) bins[4]++;
        else if (t < 35) bins[5]++;
        else             bins[6]++;
    });

    if (barChart) barChart.destroy();
    barChart = new Chart(document.getElementById('histBarChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ranges,
            datasets: [{ data: bins, backgroundColor: ['#3498db','#3498db','#2ecc71','#2ecc71','#f1c40f','#e74c3c','#e74c3c'], borderRadius: 4 }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#6b6b88', font: { family: 'Share Tech Mono', size: 10 } }, grid: { display: false } },
                y: { ticks: { color: '#6b6b88', font: { family: 'Share Tech Mono', size: 10 } }, grid: { color: '#1e1e2a' } }
            }
        }
    });
}

function renderPieChart(hums) {
    let dry = 0, comfort = 0, humid = 0;
    hums.forEach(h => { if (h < 30) dry++; else if (h <= 60) comfort++; else humid++; });

    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById('histPieChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Dry (<30%)', 'Comfort (30–60%)', 'Humid (>60%)'],
            datasets: [{ data: [dry, comfort, humid], backgroundColor: ['#f1c40f','#2ecc71','#3498db'], borderWidth: 0 }]
        },
        options: {
            cutout: '60%',
            plugins: { legend: { position: 'bottom', labels: { color: '#6b6b88', padding: 16, font: { family: 'Rajdhani', size: 12 } } } }
        }
    });
}

// =============================================
// TABLE
// =============================================
function getTempBadge(t) {
    if (t < 15) return '<span class="badge badge-low">LOW</span>';
    if (t > 30) return '<span class="badge badge-high">HIGH</span>';
    return '<span class="badge badge-ideal">IDEAL</span>';
}

function getHumBadge(h) {
    if (h < 30) return '<span class="badge badge-dry">DRY</span>';
    if (h > 60) return '<span class="badge badge-humid">HUMID</span>';
    return '<span class="badge badge-comfort">COMFORT</span>';
}

function renderTable() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end   = start + PAGE_SIZE;
    const slice = filteredData.slice(start, end);

    document.getElementById('tableBody').innerHTML = slice.map(d => `
        <tr>
            <td>${d.timestamp.replace('T', ' ').slice(0, 19)}</td>
            <td>${d.temperature}</td>
            <td>${d.humidity}</td>
            <td>${d.pressure  ?? '—'}</td>
            <td>${d.altitude  ?? '—'}</td>
            <td>${getTempBadge(d.temperature)}</td>
            <td>${getHumBadge(d.humidity)}</td>
        </tr>
    `).join('');

    document.getElementById('pageInfo').textContent =
        `Showing ${start + 1}–${Math.min(end, filteredData.length)} of ${filteredData.length}`;

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const container  = document.getElementById('pageBtns');
    let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    for (let p = Math.max(1, currentPage - 2); p <= Math.min(totalPages, currentPage + 2); p++) {
        html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</button>`;
    }
    html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
    container.innerHTML = html;
}

function goPage(p) {
    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    renderTable();
}

function filterTable() {
    const q = document.getElementById('tableSearch').value.toLowerCase();
    filteredData = allData.filter(d =>
        d.timestamp.toLowerCase().includes(q) ||
        String(d.temperature).includes(q) ||
        String(d.humidity).includes(q)
    );
    currentPage = 1;
    renderTable();
}

function sortTable(key) {
    if (sortKey === key) sortDir *= -1;
    else { sortKey = key; sortDir = -1; }
    document.querySelectorAll('th').forEach(th => th.classList.remove('sorted'));
    document.getElementById('th-' + key)?.classList.add('sorted');
    filteredData.sort((a, b) => {
        const av = key === 'timestamp' ? a[key] : parseFloat(a[key]);
        const bv = key === 'timestamp' ? b[key] : parseFloat(b[key]);
        return av < bv ? sortDir : av > bv ? -sortDir : 0;
    });
    currentPage = 1;
    renderTable();
}

function exportCSV() {
    const header = 'timestamp,temperature,humidity,pressure,altitude\n';
    const rows   = filteredData.map(d =>
        `${d.timestamp},${d.temperature},${d.humidity},${d.pressure ?? ''},${d.altitude ?? ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sensor_history.csv';
    a.click();
}

// =============================================
// DATE RANGE CONTROLS
// =============================================
function setRange(days) {
    activeDays = days;
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    const labels = { 1: '24 hours', 7: '7 days', 30: '30 days', 90: '90 days' };
    document.getElementById('lineLabel').textContent  = labels[days] || `${days}d`;
    document.getElementById('lineLabel2').textContent = labels[days] || `${days}d`;
    const to   = new Date();
    const from = new Date(to.getTime() - days * 86400000);
    loadHistoricData(from.toISOString(), to.toISOString());
}

function applyCustomRange() {
    const from = document.getElementById('dateFrom').value;
    const to   = document.getElementById('dateTo').value;
    if (!from || !to) return alert('Please select both dates.');
    document.getElementById('lineLabel').textContent = `${from} → ${to}`;
    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    loadHistoricData(new Date(from).toISOString(), new Date(to + 'T23:59:59').toISOString());
}

// =============================================
// INIT
// =============================================
(function init() {
    const to   = new Date();
    const from = new Date(to.getTime() - 7 * 86400000);
    document.getElementById('dateFrom').value = from.toISOString().slice(0, 10);
    document.getElementById('dateTo').value   = to.toISOString().slice(0, 10);
    loadHistoricData(from.toISOString(), to.toISOString());
})();
