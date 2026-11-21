

// Read Kaggle CSV Dataset
Papa.parse("data.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,

    transformHeader: header => header.trim(),

    complete: function(results) {
        const data = results.data;

        if (!data.length) {
            alert("CSV data could not be loaded.");
            return;
        }

        // Calculate Total Sales, Profit and Orders
        const totalSales = data.reduce(
            (sum, item) => sum + Number(item.Sales || 0), 0
        );

        const totalProfit = data.reduce(
            (sum, item) => sum + Number(item.Profit || 0), 0
        );

        const totalOrders = new Set(
            data.map(item => item["Order ID"])
        ).size;

        // Display Summary
        document.getElementById("totalSales").textContent =
            "$" + totalSales.toLocaleString("en-US", {
                maximumFractionDigits: 2
            });

        document.getElementById("totalProfit").textContent =
            "$" + totalProfit.toLocaleString("en-US", {
                maximumFractionDigits: 2
            });

        document.getElementById("totalOrders").textContent =
            totalOrders.toLocaleString("en-US");

        // Category-wise Sales
        const categories = [...new Set(
            data.map(item => item.Category)
        )];

        const categorySales = categories.map(category =>
            data
                .filter(item => item.Category === category)
                .reduce((sum, item) => sum + Number(item.Sales || 0), 0)
        );

        // Region-wise Sales
        const regions = [...new Set(
            data.map(item => item.Region)
        )];

        const regionSales = regions.map(region =>
            data
                .filter(item => item.Region === region)
                .reduce((sum, item) => sum + Number(item.Sales || 0), 0)
        );

        // Monthly Sales
        const monthlyData = {};

        data.forEach(item => {
            const parts = item["Order Date"].split("/");

            const month = parts[0].padStart(2, "0");
            const year = parts[2];

            const key = year + "-" + month;

            monthlyData[key] =
                (monthlyData[key] || 0) + Number(item.Sales || 0);
        });

        const sortedMonths = Object.keys(monthlyData).sort();

        const monthLabels = sortedMonths.map(key => {
            const [year, month] = key.split("-");
            return new Date(
                Number(year),
                Number(month) - 1
            ).toLocaleString("en-US", {
                month: "short",
                year: "numeric"
            });
        });

        const monthlySales = sortedMonths.map(
            key => monthlyData[key]
        );

        // Bar Chart
        new Chart(document.getElementById("barChart"), {
            type: "bar",
            data: {
                labels: categories,
                datasets: [{
                    label: "Sales ($)",
                    data: categorySales,
                    backgroundColor: ["#5277a8", "#72a5a0", "#e6b566"]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Pie Chart
        new Chart(document.getElementById("pieChart"), {
            type: "pie",
            data: {
                labels: regions,
                datasets: [{
                    data: regionSales,
                    backgroundColor: [
                        "#5277a8",
                        "#72a5a0",
                        "#e6b566",
                        "#b18bb5"
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });

        // Line Chart
        new Chart(document.getElementById("lineChart"), {
            type: "line",
            data: {
                labels: monthLabels,
                datasets: [{
                    label: "Monthly Sales ($)",
                    data: monthlySales,
                    borderColor: "#5277a8",
                    backgroundColor: "rgba(82, 119, 168, 0.15)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    },

    error: function(error) {
        console.error("CSV loading error:", error);
        alert("Unable to load CSV file.");
    }
});
