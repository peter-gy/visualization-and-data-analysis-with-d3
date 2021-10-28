/**
 * The SVG Element serving as the canvas of the line chart
 */
const lineChartTag = d3.select("#line-chart");

/**
 * The SVG Element serving as the canvas of the brushable area
 */
const brushTag = d3.select("#brushable-area");

/**
 * Path to the CSV file serving as the data source of the chart
 * @type {string}
 */
const fileName = "assets/data/usa_nominal_gdp_1997-2020.csv";

/**
 * Loads the contents of the CSV file based on the supplied ``fileName``
 * @param fileName
 * @returns {Promise<*[]>}
 */
async function loadData(fileName) {
    const data = [];
    await d3.csv(fileName, (rawData) => data.push(rawData));
    return data;
}

/**
 * Act as soon as the DOM is loaded
 */
window.addEventListener("DOMContentLoaded", async () => {
    const data = await loadData(fileName);
    console.log(data)
});
