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
 * Data-related property names
 * @type {{gdp: string, state: string}}
 */
const DataProps = {
    state: 'State',
    gdp: 'GDP'
};

/**
 * The SVG Element serving as the canvas of the chart
 */
const svgTag = d3.select('#bar-chart');

/**
 * Path to the CSV file serving as the data source of the chart
 * @type {string}
 */
const fileName = 'assets/data/usa_nominal_gdp_top10_2021.csv';

/**
 * Percentage of the screen height to be taken by the chart.
 * Extracted from the tailwind JIT class.
 * @type {number}
 */
const heightPercentage = +svgTag.node().className.baseVal.match(/h-\[([0-9]+)vh]/)[1] * 0.01;

/**
 * Percentage of the screen width to be taken by the chart.
 * Extracted from the tailwind JIT class.
 * @type {number}
 */
const widthPercentage = +svgTag.node().className.baseVal.match(/w-\[([0-9]+)vw]/)[1] * 0.01;

/**
 * Percentage to be used in combination with the current SVG width
 * to set the margin responsively
 * @type {number}
 */
const marginPercentage = 0.075;

/**
 * Percentage to be used in combination with the current SVG width
 * to set the padding responsively
 * @type {number}
 */
const paddingPercentage = 0.00025;

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
 * Computes the chart's layout based on the current window height and width.
 * Facilitates the responsive sizing of the chart.
 * @returns {{[p: string]: number}}
 */
function calculateLayout() {
    const height = window.innerHeight * heightPercentage;
    const width = window.innerWidth * widthPercentage;
    const padding = width * paddingPercentage;
    const margin = width * marginPercentage;
    return {
        [LayoutProps.padding]: padding,
        [LayoutProps.margin]: margin,
        [LayoutProps.height]: height - 2 * margin,
        [LayoutProps.width]: width - 2 * margin,
        [LayoutProps.fontSize]: width / 100
    };
}

function calculateXScale(range, data, layout) {
    return d3.scaleBand().range(range).domain(data).padding(layout[LayoutProps.padding]);
}

function assembleXScale(data, layout) {
    const range = [0, layout[LayoutProps.width]];
    const xData = data.map((d) => d[DataProps.state]);
    return calculateXScale(range, xData, layout);
}

function drawXAxis(chart, xScale, layout) {
    chart
        .append('g')
        .attr('transform', `translate(0, ${layout[LayoutProps.height]})`)
        .call(d3.axisBottom(xScale));
}

function calculateYScale(range, data) {
    return d3
        .scaleLinear()
        .range(range)
        .domain([0, data[data.length - 1]]);
}

function assembleYScale(data, layout) {
    const range = [layout[LayoutProps.height], 0];
    const yData = [0, ...data.map((d) => d[DataProps.gdp])].sort((a, b) => a - b);
    return calculateYScale(range, yData);
}

function drawYAxis(chart, yScale) {
    chart.append('g').call(d3.axisLeft(yScale));
}

function drawBars(chart, data, xScale, yScale, layout) {
    chart
        .selectAll()
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d[DataProps.state]))
        .attr('y', (d) => yScale(d[DataProps.gdp]))
        .attr('height', (d) => layout[LayoutProps.height] - yScale(d[DataProps.gdp]))
        .attr('width', (_) => xScale.bandwidth());
}

function drawXAxisLabel(layout) {
    svgTag
        .append('text')
        .text('States')
        .attr('font-weight', 'bold')
        .style('font-size', `${1.25 * layout[LayoutProps.fontSize]}px`)
        .attr('text-anchor', 'middle')
        .attr('x', layout[LayoutProps.width] / 2 + layout[LayoutProps.margin])
        .attr('y', layout[LayoutProps.height] + 1.65 * layout[LayoutProps.margin]);
}

function drawYAxisLabel(layout) {
    svgTag
        .append('text')
        .text('Nominal GDP (millions of $)')
        .attr('font-weight', 'bold')
        .style('font-size', `${1.25 * layout[LayoutProps.fontSize]}px`)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(layout[LayoutProps.height] / 2) - layout[LayoutProps.margin])
        .attr('y', 0.125 * layout[LayoutProps.margin]);
}

function draw(data) {
    svgTag.selectAll('*').remove();
    const layout = calculateLayout();

    const chart = svgTag
        .append('g')
        .attr(
            'transform',
            `translate(${layout[LayoutProps.margin]}, ${layout[LayoutProps.margin]})`
        );

    const xScale = assembleXScale(data, layout);
    const yScale = assembleYScale(data, layout);

    drawBars(chart, data, xScale, yScale, layout);

    drawXAxis(chart, xScale, layout);
    drawYAxis(chart, yScale);
    d3.selectAll('text').style('font-size', `${layout[LayoutProps.fontSize]}px`);

    drawXAxisLabel(layout);
    drawYAxisLabel(layout);
}

/**
 * Act as soon as the DOM is loaded
 */
window.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData(fileName);
    draw(data);

    // Add responsivity by listening to window resizes
    window.onresize = () => draw(data);
});
