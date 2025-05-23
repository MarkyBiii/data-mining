document.addEventListener('DOMContentLoaded', () => {
  Papa.parse('dataset/final_dataset_melt.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;

      // Extract all years from data
      const allYearsSet = new Set(data.map(row => row.Year));
      let allYears = Array.from(allYearsSet).sort((a,b) => Number(a) - Number(b));

      // Extract unique regions
      const regionsSet = new Set(data.map(row => row.Region));
      const regions = Array.from(regionsSet);

      // Filter years that have at least one valid turnout percent
      const validYears = allYears.filter(year => 
        data.some(row => row.Year === year && row.Turnout_Percent !== '' && !isNaN(row.Turnout_Percent))
      );

      // Build datasets for each region
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
          borderColor: color.replace('rgb', 'rgba').replace(')', ', 0.7)'), // transparency
          borderWidth: 1, // thinner lines
          fill: false,
          tension: 0.2
        };
      });

      // Flatten all data points and filter out nulls to find min and max turnout %
      const allTurnoutValues = datasets.flatMap(ds => ds.data).filter(val => val !== null);

      // Determine y-axis min and max with some padding (5%)
      let yMin, yMax;
      if (allTurnoutValues.length > 0) {
        const dataMin = Math.min(...allTurnoutValues);
        const dataMax = Math.max(...allTurnoutValues);
        yMin = Math.max(0, Math.floor(dataMin / 5) * 5 - 5);  // round down to nearest 5 and subtract 5, but no less than 0
        yMax = Math.min(100, Math.ceil(dataMax / 5) * 5 + 5); // round up to nearest 5 and add 5, max 100
      } else {
        // fallback to default
        yMin = 0;
        yMax = 100;
      }

      const ctxTop = document.getElementById('topLineChart').getContext('2d');

      new Chart(ctxTop, {
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
    }
  });
});

function getRandomColor() {
  const r = Math.floor(Math.random()*200) + 30;
  const g = Math.floor(Math.random()*200) + 30;
  const b = Math.floor(Math.random()*200) + 30;
  return `rgb(${r}, ${g}, ${b})`;
}
