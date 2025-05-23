let classificationChart;

document.addEventListener('DOMContentLoaded', () => {
    Papa.parse('ddataset/classification_prediction.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const data = results.data;

            // Fix: use Predicted_Turnout_Category instead of Classification
            const categoryCounts = data.reduce((acc, row) => {
                const category = row['Predicted_Turnout_Category'];
                if (!category) return acc;

                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(categoryCounts);
            const counts = labels.map(label => categoryCounts[label]);
            const backgroundColors = labels.map(() => getRandomColor());

            const ctx = document.getElementById('bottomLineChart').getContext('2d');
            classificationChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of Regions',
                        data: counts,
                        backgroundColor: backgroundColors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Number of Regions by Predicted Turnout Category'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: ${context.parsed.y} region(s)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Regions'
                            },
                            ticks: {
                                stepSize: 1
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Predicted Turnout Category'
                            }
                        }
                    }
                }
            });

            // Optional: hide unused selector
            const selector = document.getElementById('bottomRegionSelector');
            if (selector) {
                selector.style.display = 'none';
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
