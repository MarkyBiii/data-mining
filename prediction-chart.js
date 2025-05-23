let bottomChart;
let regionsPrediction = [];

document.addEventListener('DOMContentLoaded', () => {
    Papa.parse('dataset/regression_prediction.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const data = results.data;

            // Extract years and regions
            const yearsSet = new Set(data.map(row => row.Year));
            const years = Array.from(yearsSet).sort((a, b) => Number(a) - Number(b));

            const regionsSet = new Set(data.map(row => row.Region));
            regionsPrediction = Array.from(regionsSet);

            // Prepare datasets for each region
            const datasets = regionsPrediction.map(region => {
                const regionRows = data.filter(row => row.Region === region);

                const yearMap = {};
                regionRows.forEach(row => {
                    const turnoutPercent = parseFloat(row.Turnout_Percent);
                    const registered = row.Registered_Voters ? Number(row.Registered_Voters) : null;
                    const actual = row.Voter_Count ? Number(row.Voter_Count) : null;

                    yearMap[row.Year] = {
                        turnout: turnoutPercent,
                        registered,
                        actual,
                    };
                });

                const turnoutData = [];
                const registeredData = [];
                const actualData = [];

                years.forEach(year => {
                    if (yearMap[year] && !isNaN(yearMap[year].turnout)) {
                        turnoutData.push(yearMap[year].turnout);
                        registeredData.push(yearMap[year].registered);
                        actualData.push(yearMap[year].actual);
                    } else {
                        turnoutData.push(null);
                        registeredData.push(null);
                        actualData.push(null);
                    }
                });

                const color = getRandomColor();

                return {
                    label: region,
                    data: turnoutData,
                    borderColor: color.replace('rgb', 'rgba').replace(')', ', 0.7)'),
                    borderWidth: 1,
                    fill: false,
                    tension: 0.2,
                    _extraData: {
                        registered: registeredData,
                        actual: actualData
                    }
                };
            });

            // Calculate y-axis range based on turnout percent data
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

            const ctxBottom = document.getElementById('bottomLineChart').getContext('2d');

            bottomChart = new Chart(ctxBottom, {
                type: 'line',
                data: {
                    labels: years,
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
                            text: '2028 Turnout % Prediction by Region'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const dataset = context.dataset;
                                    const index = context.dataIndex;

                                    const turnout = context.parsed.y != null ? context.parsed.y.toFixed(2) : 'N/A';

                                    let registered = dataset._extraData.registered[index];
                                    let actual = dataset._extraData.actual[index];

                                    registered = registered != null ? registered.toLocaleString() : 'N/A';
                                    actual = actual != null ? actual.toLocaleString() : 'N/A';

                                    return [
                                        `${dataset.label}: ${turnout}%`,
                                        `Registered Voters: ${registered}`,
                                        `Actual Voters (estimated): ${actual}`
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

            // Populate bottomRegionSelector dropdown with regions
            const bottomSelector = document.getElementById('bottomRegionSelector');
            if (bottomSelector) {
                regionsPrediction.forEach(region => {
                    const option = document.createElement('option');
                    option.value = region;
                    option.textContent = region;
                    bottomSelector.appendChild(option);
                });

                bottomSelector.addEventListener('change', () => {
                    const selected = bottomSelector.value;

                    if (selected === 'all') {
                        bottomChart.data.datasets.forEach(ds => ds.hidden = false);
                    } else {
                        bottomChart.data.datasets.forEach(ds => {
                            ds.hidden = ds.label !== selected;
                        });
                    }
                    bottomChart.update();
                });
            }
        }
    });
});

function getRandomColor() {
    const r = Math.floor(Math.random() * 200) + 30;
    const g = Math.floor(Math.random() * 200) + 30;
    const b = Math.floor(Math.random() * 200) + 30;
    return `rgb(${r}, ${g}, ${b})`;
}
