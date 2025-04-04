document.addEventListener("DOMContentLoaded", () => {
    const csvFilePath = "assets/data/all_gbi_data.csv";

    fetch(csvFilePath)
        .then(response => response.text())
        .then(data => {
            const rows = data.split("\n").slice(1); // Skip the header row
            const dates = [];
            const values = [];

            rows.forEach(row => {
                const columns = row.split(",");
                if (columns.length > 1) {
                    dates.push(columns[0]); // Date column
                    values.push(parseFloat(columns[1])); // Value column
                }
            });

            renderChart(dates, values);
        });

    function renderChart(labels, data) {
        const ctx = document.getElementById("chart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Value Over Time",
                    data: data,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Date"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Value"
                        }
                    }
                }
            }
        });
    }
});