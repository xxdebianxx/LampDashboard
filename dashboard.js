// =============================================
// LIVE DASHBOARD — dashboard.js
// =============================================

// --- Chart Setup ---
const ctxLine = document.getElementById('lineChart').getContext('2d');
const lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Temp (°C)', borderColor: '#e74c3c', data: [], tension: 0.3 },
            { label: 'Hum (%)',   borderColor: '#3498db', data: [], tension: 0.3 }
        ]
    },
    options: {
        scales: { y: { beginAtZero: true, grid: { color: '#333' } } }
    }
});

const ctxBar = document.getElementById('barChart').getContext('2d');
const barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: ['Low (<15)', 'Ideal (15-30)', 'High (>30)'],
        datasets: [{ data: [0, 0, 0], backgroundColor: ['#3498db', '#2ecc71', '#e74c3c'] }]
    },
    options: { plugins: { legend: { display: false } } }
});

const ctxPie = document.getElementById('pieChart').getContext('2d');
const pieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
        labels: ['Dry', 'Comfort', 'Humid'],
        datasets: [{ data: [0, 0, 0], backgroundColor: ['#f1c40f', '#2ecc71', '#3498db'] }]
    }
});

// --- Accumulators ---
let lowCount = 0, idealCount = 0, highCount = 0;
let dryCount = 0, comfortCount = 0, humidCount = 0;

// --- Stats Update ---
function updateStats(t, h) {
    // Temperature bar chart
    if (t < 15) lowCount++;
    else if (t > 30) highCount++;
    else idealCount++;
    barChart.data.datasets[0].data = [lowCount, idealCount, highCount];
    barChart.update();

    // Humidity pie chart
    if (h < 30)           dryCount++;
    else if (h <= 60)     comfortCount++;
    else                  humidCount++;
    pieChart.data.datasets[0].data = [dryCount, comfortCount, humidCount];
    pieChart.update();
}

// --- Data Fetching ---
async function updateDashboard() {
    try {
        const response = await fetch('get_latest_data.php');
        const data = await response.json();

        // Keep last 10 readings on line chart
        if (lineChart.data.labels.length > 10) {
            lineChart.data.labels.shift();
            lineChart.data.datasets[0].data.shift();
            lineChart.data.datasets[1].data.shift();
        }
        lineChart.data.labels.push(new Date().toLocaleTimeString());
        lineChart.data.datasets[0].data.push(data.temperature);
        lineChart.data.datasets[1].data.push(data.humidity);
        lineChart.update();

        updateStats(data.temperature, data.humidity);

        document.getElementById('statusLed').style.background = '#00ff00';
    } catch (e) {
        document.getElementById('statusLed').style.background = '#e74c3c';
    }
}

setInterval(updateDashboard, 5000);
