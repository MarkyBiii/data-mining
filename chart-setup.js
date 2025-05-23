let topChart;  // Global variable for the chart instance
let regions = []; // to store regions globally

document.addEventListener('DOMContentLoaded', () => {
  Papa.parse('dataset/final_dataset_melt.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;

      // Extract years & regions (same as before)
      const allYearsSet = new Set(data.map(row => row.Year));
      let allYears = Array.from(allYearsSet).sort((a,b) => Number(a) - Number(b));

      const regionsSet = new Set(data.map(row => row.Region));
      regions = Array.from(regionsSet);  // store globally for later use

      const validYears = allYears.filter(year => 
        data.some(row => row.Year === year && row.Turnout_Percent !== '' && !isNaN(row.Turnout_Percent))
      );

      const datasets = regions.map(region => {
        const regionRows = data.filter(row => row.Region === region);

        const turnoutMap = {};
        regionRows.forEach(row => {
          const val = parseFloat(row.Turnout_Percent);
          if (!isNaN(val)) turnoutMap[row.Year] = val;
        });

        const dataPoints = validYears.map(year => turnoutMap[year] ?? null);

        const color = getRandomColor();

        return {
          label: region,
          data: dataPoints,
          borderColor: color.replace('rgb', 'rgba').replace(')', ', 0.7)'),
          borderWidth: 1,
          fill: false,
          tension: 0.2
        };
      });

      const allTurnoutValues = datasets.flatMap(ds => ds.data).filter(val => val !== null);

      let yMin, yMax;
      if (allTurnoutValues.length > 0) {
        const dataMin = Math.min(...allTurnoutValues);
        const dataMax = Math.max(...allTurnoutValues);
        yMin = Math.max(0, Math.floor(dataMin / 5) * 5 - 5);
        yMax = Math.min(100, Math.ceil(dataMax / 5) * 5 + 5);
      } else {
        yMin = 0;
        yMax = 100;
      }

      const ctxTop = document.getElementById('topLineChart').getContext('2d');

      topChart = new Chart(ctxTop, {
        type: 'line',
        data: {
          labels: validYears,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 8
              }
            },
            title: {
              display: true,
              text: 'Turnout % by Region Over Years'
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: yMin,
              max: yMax,
              title: {
                display: true,
                text: 'Turnout Percentage (%)'
              },
              ticks: {
                stepSize: 5
              }
            },
            x: {
              title: {
                display: true,
                text: 'Year'
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10,
              }
            }
          }
        }
      });

      // Populate dropdown with regions
      const selector = document.getElementById('regionSelector');
      regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        selector.appendChild(option);
      });

      // Event listener for dropdown
      selector.addEventListener('change', () => {
        const selected = selector.value;

        if (selected === 'all') {
          // Show all datasets
          topChart.data.datasets.forEach(ds => ds.hidden = false);
        } else {
          // Hide all except selected
          topChart.data.datasets.forEach(ds => {
            ds.hidden = ds.label !== selected;
          });
        }
        topChart.update();
      });

      // Event listener for show all button
      document.getElementById('showAllBtn').addEventListener('click', () => {
        selector.value = 'all'; // reset dropdown
        topChart.data.datasets.forEach(ds => ds.hidden = false);
        topChart.update();
      });
    }
  });
});

function getRandomColor() {
  const r = Math.floor(Math.random()*200) + 30;
  const g = Math.floor(Math.random()*200) + 30;
  const b = Math.floor(Math.random()*200) + 30;
  return `rgb(${r}, ${g}, ${b})`;
}
