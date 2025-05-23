document.addEventListener('DOMContentLoaded', () => {
  const ctxTop = document.getElementById('topLineChart').getContext('2d');
  const ctxBottom = document.getElementById('bottomLineChart').getContext('2d');

  const chartOptions = {
    type: 'line',
    data: {
      labels: ['2020', '2022', '2024', '2026', '2028'],
      datasets: [{
        label: 'Turnout %',
        data: [61.3, 63.5, 64.0, 65.2, 66.8],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  new Chart(ctxTop, chartOptions);
  new Chart(ctxBottom, chartOptions);
});
