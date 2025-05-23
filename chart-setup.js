let topChart;
let regions = [];

document.addEventListener('DOMContentLoaded', () => {
  Papa.parse('dataset/legitfinal_dataset_melt.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;

      const allYearsSet = new Set(data.map(row => row.Year));
      let allYears = Array.from(allYearsSet).sort((a,b) => Number(a) - Number(b));

      const regionsSet = new Set(data.map(row => row.Region));
      regions = Array.from(regionsSet);

      // Filter valid years where Turnout_Percent is a valid number for at least one region
      const validYears = allYears.filter(year =>
        data.some(row => row.Year === year && row.Turnout_Percent !== '' && !isNaN(row.Turnout_Percent))
      );

      // For each region, map years to an object with turnout, registered, and actual voters
      const datasets = regions.map(region => {
        const regionRows = data.filter(row => row.Region === region);

        const yearMap = {};
        regionRows.forEach(row => {
          yearMap[row.Year] = {
            turnout: parseFloat(row.Turnout_Percent),
            registered: row.Registered_Voters ? Number(row.Registered_Voters) : null,
            actual: row.Actual_Voters ? Number(row.Actual_Voters) : null,
          };
        });

        const dataPoints = [];
        const extraData = [];

        validYears.forEach(year => {
          if (yearMap[year] && !isNaN(yearMap[year].turnout)) {
            dataPoints.push(yearMap[year].turnout);
            extraData.push({
              registered: yearMap[year].registered,
              actual: yearMap[year].actual,
            });
          } else {
            dataPoints.push(null);
            extraData.push(null);
          }
        });

        const color = getRandomColor();

        return {
          label: region,
          data: dataPoints,
          borderColor: color.replace('rgb', 'rgba').replace(')', ', 0.7)'),
          borderWidth: 1,
          fill: false,
          tension: 0.2,
          _extraData: extraData  
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
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const dataset = context.dataset;
                  const index = context.dataIndex;

                  const turnout = context.parsed.y != null ? context.parsed.y.toFixed(2) : 'N/A';

                  let extra = dataset._extraData && dataset._extraData[index];
                  let registered = extra && extra.registered != null ? extra.registered.toLocaleString() : 'N/A';
                  let actual = extra && extra.actual != null ? extra.actual.toLocaleString() : 'N/A';

                  return [
                    `${dataset.label}: ${turnout}%`,
                    `Registered Voters: ${registered}`,
                    `Actual Voters: ${actual}`
                  ];
                }
              }
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
      if (selector) {
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
            topChart.data.datasets.forEach(ds => ds.hidden = false);
          } else {
            topChart.data.datasets.forEach(ds => {
              ds.hidden = ds.label !== selected;
            });
          }
          topChart.update();
        });
      }

      // Event listener for show all button
      const showAllBtn = document.getElementById('showAllBtn');
      if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
          if (selector) selector.value = 'all';
          topChart.data.datasets.forEach(ds => ds.hidden = false);
          topChart.update();
        });
      }
    }
  });
});

function getRandomColor() {
  const r = Math.floor(Math.random()*200) + 30;
  const g = Math.floor(Math.random()*200) + 30;
  const b = Math.floor(Math.random()*200) + 30;
  return `rgb(${r}, ${g}, ${b})`;
}

