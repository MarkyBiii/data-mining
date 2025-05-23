document.addEventListener('DOMContentLoaded', () => {
    Papa.parse('dataset/classification_prediction.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;

            const labels = [];
            const turnoutPercent = [];
            const backgroundColors = [];

            data.forEach(row => {
                labels.push(row.Region.trim());
                turnoutPercent.push(parseFloat(row.Turnout_Percent));
                
                // Color code by category
                if (row.Predicted_Turnout_Category === "High") {
                    backgroundColors.push('rgba(75, 192, 192, 0.8)'); // Teal for high
                } else {
                    backgroundColors.push('rgba(255, 99, 132, 0.8)'); // Red for low
                }
            });

            const ctx = document.getElementById('classificationLineChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Turnout %',
                        data: turnoutPercent,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: '2028 Turnout by Region (High vs Low)',
                            font: { size: 18 }
                        },
                        tooltip: {
                            callbacks: {
                                afterLabel: function (context) {
                                    const row = data[context.dataIndex];
                                    return `Predicted: ${row.Predicted_Turnout_Category} | High: ${parseFloat(row.Prob_High).toFixed(2)} | Low: ${parseFloat(row.Prob_Low).toFixed(2)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Turnout Percentage' }
                        },
                        x: {
                            ticks: {
                                maxRotation: 90,
                                minRotation: 45,
                                autoSkip: false
                            }
                        }
                    }
                }
            });
        }
    });
});
