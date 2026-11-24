
/* =========================================
   KENYA COST OF LIVING - DATA STORIES
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. MOBILE NAVIGATION
    // =====================================

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");

        menuToggle.textContent =
            navLinks.classList.contains("open") ? "✕" : "☰";
    });

    document.querySelectorAll("#navLinks a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.textContent = "☰";
        });
    });


    // =====================================
    // 2. FOOTER YEAR
    // =====================================

    document.getElementById("year").textContent =
        new Date().getFullYear();


    // =====================================
    // 3. LOAD AND PROCESS CSV DATA
    // =====================================

    async function loadCPIData() {

        try {

            const response = await fetch("data/kenya_cpi.csv");

            if (!response.ok) {
                throw new Error("Could not load the CPI dataset.");
            }

            const csvText = await response.text();

            const rows = csvText.trim().split(/\r?\n/);

            const headers = rows[0].split(",");

            const monthIndex = headers.indexOf("month");
            const cpiIndex = headers.indexOf("cpi");

            if (monthIndex === -1 || cpiIndex === -1) {
                throw new Error("The CSV must contain month and cpi columns.");
            }

            const dataset = rows.slice(1).map(row => {

                const values = row.split(",");

                return {
                    month: values[monthIndex],
                    cpi: Number(values[cpiIndex])
                };

            }).filter(item =>
                item.month && Number.isFinite(item.cpi)
            );

            if (dataset.length === 0) {
                throw new Error("The CPI dataset contains no valid records.");
            }

            return dataset;

        } catch (error) {

            console.error("Dataset error:", error);

            showDataError(
                "The CPI dataset could not be loaded. Check data/kenya_cpi.csv and run the website using a local server."
            );

            return [];

        }

    }


    // =====================================
    // 4. DISPLAY DATA LOADING ERRORS
    // =====================================

    function showDataError(message) {

        const errorMessage = document.createElement("p");

        errorMessage.className = "data-error";
        errorMessage.textContent = message;
        errorMessage.setAttribute("role", "alert");

        document.querySelectorAll(".chart-card").forEach(card => {
            card.prepend(errorMessage.cloneNode(true));
        });

    }


    // =====================================
    // 5. CALCULATE MONTHLY CPI CHANGE
    // =====================================

    function calculateChanges(dataset) {

        return dataset.map((item, index) => {

            if (index === 0) {
                return {
                    ...item,
                    change: null
                };
            }

            const previousCPI = dataset[index - 1].cpi;

            const change =
                ((item.cpi - previousCPI) / previousCPI) * 100;

            return {
                ...item,
                change: Number(change.toFixed(2))
            };

        });

    }


    // =====================================
    // 6. CREATE CPI LINE CHART
    // =====================================

    function createCPIChart(dataset) {

        const canvas = document.getElementById("cpiChart");

        if (!canvas) return;

        new Chart(canvas, {

            type: "line",

            data: {

                labels: dataset.map(item => item.month),

                datasets: [{

                    label: "Consumer Price Index",

                    data: dataset.map(item => item.cpi),

                    borderColor: "#39745C",

                    backgroundColor: "rgba(57, 116, 92, 0.10)",

                    borderWidth: 3,

                    fill: true,

                    tension: 0.35,

                    pointRadius: 4,

                    pointHoverRadius: 7,

                    pointBackgroundColor: "#173D32"

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        backgroundColor: "#173D32",

                        padding: 12,

                        callbacks: {

                            label: context =>
                                ` CPI: ${context.parsed.y.toFixed(2)}`

                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: false,

                        title: {
                            display: true,
                            text: "CPI index"
                        },

                        grid: {
                            color: "#E9ECE8"
                        }

                    },

                    x: {

                        grid: {
                            display: false
                        },

                        ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            autoSkip: true
                        }

                    }

                }

            }

        });

    }


    // =====================================
    // 7. CATEGORY INFLATION CHART
    // =====================================

    function createCategoryChart() {

        const canvas = document.getElementById("categoryChart");

        if (!canvas) return;

        const categories = [
            "Food & non-alcoholic beverages",
            "Transport",
            "Housing, water & energy"
        ];

        const inflation = [
            4.8,
            0.2,
            -0.2
        ];

        new Chart(canvas, {

            type: "bar",

            data: {

                labels: categories,

                datasets: [{

                    label: "Annual inflation (%)",

                    data: inflation,

                    backgroundColor: [
                        "#39745C",
                        "#D8A45D",
                        "#A7B9AE"
                    ],

                    borderRadius: 5,

                    barThickness: 45

                }]

            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        backgroundColor: "#173D32",

                        callbacks: {

                            label: context =>
                                ` ${context.parsed.x}%`

                        }

                    }

                },

                scales: {

                    x: {

                        title: {
                            display: true,
                            text: "Annual inflation (%)"
                        },

                        grid: {
                            color: "#E9ECE8"
                        }

                    },

                    y: {

                        grid: {
                            display: false
                        }

                    }

                }

            }

        });

    }


    // =====================================
    // 8. SCROLL REVEAL ANIMATIONS
    // =====================================

    function setupRevealAnimations() {

        const elements = document.querySelectorAll(
            ".stat-card, .chart-card, .finding-card, .source-card"
        );

        elements.forEach(element => {
            element.classList.add("reveal");
        });

        if ("IntersectionObserver" in window) {

            const observer = new IntersectionObserver(entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            }, {
                threshold: 0.12
            });

            elements.forEach(element => observer.observe(element));

        } else {

            elements.forEach(element => element.classList.add("visible"));

        }

    }


    // =====================================
    // 9. NAVIGATION ACTIVE STATE
    // =====================================

    function setupActiveNavigation() {

        const sections = document.querySelectorAll(
            "#overview, #trends, #categories, #findings"
        );

        const links = document.querySelectorAll("#navLinks a");

        if (!("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    links.forEach(link => {

                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === `#${entry.target.id}`
                        );

                    });

                }

            });

        }, {
            rootMargin: "-25% 0px -60% 0px"
        });

        sections.forEach(section => observer.observe(section));

    }


    // =====================================
    // 10. INITIALISE WEBSITE
    // =====================================

    async function initialiseWebsite() {

        const dataset = await loadCPIData();

        if (dataset.length > 0) {

            const processedData = calculateChanges(dataset);

            console.log("Loaded CPI dataset:", dataset);

            console.log(
                "Calculated monthly changes:",
                processedData
            );

            createCPIChart(processedData);

        }

        createCategoryChart();

        setupRevealAnimations();

        setupActiveNavigation();

    }


    initialiseWebsite();

});
