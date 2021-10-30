/**
 * Layout-related property names
 * @type {{padding: string, margin: string, width: string, fontSize: string, height: string}}
 */
const LayoutProps = {
    padding: 'padding',
    margin: 'margin',
    width: 'width',
    height: 'height',
    fontSize: 'fontSize'
};

/**
 * Data-related property names.
 * @type {{state: string, values: string}}
 */
const DataProps = {
    state: 'State',
    values: 'Values'
};

/**
 * Starting and ending year of the data
 */
const [startYear, endYear] = [1997, 2020];
const years = [...Array(1 + endYear - startYear).keys()].map((i) => i + startYear);

/**
 * Path to the CSV file serving as the data source of the chart
 * @type {string}
 */
const fileName = 'assets/data/usa_nominal_gdp_1997-2020.csv';

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
 * Takes the raw data loaded by ``loadData`` and transforms it into a structure
 * such that it is easier to work with it.
 * @param data the return value of ``loadData``
 * @returns {{State: string, Values: number[],}[]}
 */
function transformData(data) {
    return data.map((obj) => ({
        [DataProps.state]: obj[DataProps.state],
        [DataProps.values]: years.map((year) => +obj[year])
    }));
}

/**
 * The SVG Element serving as the canvas of the line chart
 */
const lineChartTag = d3.select('#line-chart');
// Extracting dimensions from the Tailwind JIT class
const lineChartHeightPct =
    +lineChartTag.node().className.baseVal.match(/h-\[([0-9]+)vh]/)[1] * 0.01;
const lineChartWidthPct = +lineChartTag.node().className.baseVal.match(/w-\[([0-9]+)vw]/)[1] * 0.01;

/**
 * The SVG Element serving as the canvas of the brushable area
 */
const brushTag = d3.select('#brushable-area');
// Extracting dimensions from the Tailwind JIT class
const brushHeightPct = +brushTag.node().className.baseVal.match(/h-\[([0-9]+)vh]/)[1] * 0.01;
const brushWidthPct = +brushTag.node().className.baseVal.match(/w-\[([0-9]+)vw]/)[1] * 0.01;

const paddingPct = 0.00025;
const marginPct = 0.075;

/**
 * Computes a chart's layout based on the current window height and width.
 * Facilitates the responsive sizing of the chart.
 * @returns {{[p: string]: number}}
 */
function calculateLayout(heightPct, widthPct, paddingPct, marginPct) {
    const height = window.innerHeight * heightPct;
    const width = window.innerWidth * widthPct;
    const padding = width * paddingPct;
    const margin = width * marginPct;
    return {
        [LayoutProps.padding]: padding,
        [LayoutProps.margin]: margin,
        [LayoutProps.height]: height - 2 * margin,
        [LayoutProps.width]: width - 2 * margin,
        [LayoutProps.fontSize]: width / 100
    };
}

function allValues(data) {
    return data.map((obj) => obj[DataProps.values]).flat();
}

function drawLineChart(tag, data) {
    tag.selectAll('*').remove();
    const layout = calculateLayout(lineChartHeightPct, lineChartWidthPct, paddingPct, marginPct);

    // Create margins
    const chart = tag
        .append('g')
        .attr(
            'transform',
            `translate(${layout[LayoutProps.margin]}, ${layout[LayoutProps.margin]})`
        );

    // Create the horizontal scale and axis
    const xScale = d3
        .scaleLinear()
        .domain([years[0], years[years.length - 1]])
        .range([0, layout[LayoutProps.width]]);
    const xAxis = d3
        .axisBottom(xScale)
        .ticks(years.length)
        .tickFormat((t) => `${t}`);
    // Append the x-axis
    chart.append('g').attr('transform', `translate(0, ${layout[LayoutProps.height]})`).call(xAxis);

    // Create the vertical scale and axis
    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(allValues(data))])
        .range([layout[LayoutProps.height], 0]);
    const yAxis = d3.axisLeft(yScale);
    // Append the y-axis
    chart.append('g').call(yAxis);

    // Create the lines
    chart
        .selectAll('.line')
        .data(data)
        .join('path')
        .attr('fill', 'none')
        .attr('stroke', '#888888')
        .attr('stroke-width', 0.75)
        // ``element`` is a single element of ``data``
        .attr('d', (element) =>
            d3
                .line()
                // ``val`` is a single element of ``element[DataProps.values]``
                .x((val, idx) => xScale(startYear + idx))
                .y((val) => yScale(val))(element[DataProps.values])
        );
}

/**
 * Act as soon as the DOM is loaded
 */
window.addEventListener('DOMContentLoaded', async () => {
    const data = transformData(await loadData(fileName));
    drawLineChart(lineChartTag, data);

    // Add responsiveness by listening to window resizes
    window.onresize = () => {
        drawLineChart(lineChartTag, data);
    };
});
