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
const years = [...Array(1 + endYear - startYear).keys()].map(
    (i) => i + startYear
);

/**
 * Path to the CSV file serving as the data source of the chart
 * @type {string}
 */
const fileName = 'assets/data/usa_nominal_gdp_1997-2020.csv';

/**
 * An array to store the data pieces on a line click.
 * Used to re-highlight lines after redraws.
 * @type {{State: string, Values: number[]}[]}
 */
const permanentlySelectedData = [];

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
const lineChartWidthPct =
    +lineChartTag.node().className.baseVal.match(/w-\[([0-9]+)vw]/)[1] * 0.01;

/**
 * The SVG Element serving as the canvas of the brushable area
 */
const brushTag = d3.select('#brushable-area');
// Extracting dimensions from the Tailwind JIT class
const brushHeightPct =
    +brushTag.node().className.baseVal.match(/h-\[([0-9]+)vh]/)[1] * 0.01;
const brushWidthPct =
    +brushTag.node().className.baseVal.match(/w-\[([0-9]+)vw]/)[1] * 0.01;

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

/**
 * Returns all the values flattened from the nested ``data`` structure.
 * @param data {{State: string, Values: number[],}[]}
 * @returns {number[]}
 */
function allValues(data) {
    return data.map((obj) => obj[DataProps.values]).flat();
}

function createXScale(layout) {
    return d3
        .scaleLinear()
        .domain([years[0], years[years.length - 1]])
        .range([0, layout[LayoutProps.width]]);
}

/**
 * Function to be used for the x-axis tick formatting.
 * Maps date-like strings to real numbers.
 * @param linYear {number} the year to be formatted - might be fractional.
 * @returns {string}
 */
function dateFormatter(linYear) {
    const integerPart = ~~linYear;
    const fractionalPart = linYear - integerPart;
    // Use the year as it is, if there is no fractional part
    if (fractionalPart === 0) return `${linYear}`;
    // Else map the fractional part to the closest month
    const monthIdx = Math.floor(fractionalPart / (1 / 12)) - 1;
    const monthNameFormat = new Intl.DateTimeFormat('en-US', { month: 'short' })
        .format;
    const monthName = monthNameFormat(new Date(integerPart, monthIdx));
    return `${integerPart} ${monthName}`;
}

function createXAxis(xScale) {
    return d3.axisBottom(xScale).ticks(years.length).tickFormat(dateFormatter);
}

function appendXAxis(layout, xAxis, tag) {
    return tag
        .append('g')
        .attr('transform', `translate(0, ${layout[LayoutProps.height]})`)
        .call(xAxis);
}

function createYScale(layout, data) {
    return d3
        .scaleLinear()
        .domain([0, d3.max(allValues(data))])
        .range([layout[LayoutProps.height], 0]);
}

function createYAxis(yScale) {
    return (
        d3
            .axisLeft(yScale)
            .ticks(8)
            // Divide through 1M to be in sync with the axis label
            .tickFormat((t) => `${t / 10 ** 6} M`)
    );
}

function appendYAxis(layout, yAxis, tag) {
    return tag.append('g').call(yAxis);
}

/**
 * Returns the name of a state without any spaces.
 * Used to assign IDs to the hover labels.
 * @param stateName {string}
 * @returns {string}
 */
function normalizeStateName(stateName) {
    return stateName.replaceAll(' ', '');
}

function markLineAsPermanentlyActive(lineData) {
    d3.select(`#${normalizeStateName(lineData[DataProps.state])}Line`).classed(
        'permanently-active',
        true
    );
}

/**
 * Adds the state label next to the line extracted from ``event.target``
 * and highlights it.
 */
function activateLine(tag, layout, xScale, yScale, lineData) {
    // ``highYear`` is used to calculate the x-coordinate of the label
    const highYear = xScale.domain()[1];
    // ``closestValue`` is used to calculate the y-coordinate of the label
    const closestValue = lineData.Values[Math.round(highYear) - startYear];
    // Show the label
    const label = tag
        .append('text')
        .text(lineData.State)
        // Set the opacity to 0.0 so that it can be animated to 1.0 later
        .attr('fill-opacity', 0.0)
        .style('font-size', `${layout[LayoutProps.fontSize]}px`)
        .attr('text-anchor', 'right')
        // add a horizontal spacing of ``5`` to the labels
        .attr('x', xScale(highYear) + 5)
        .attr('y', yScale(closestValue))
        .attr('id', `${normalizeStateName(lineData.State)}Label`)
        .classed('state-label', true);

    // Display the label in an animated way by transitioning its opacity to 1.0
    label.transition().attr('fill-opacity', 1.0);

    // Highlight the line by recoloring it and making it wider
    d3.select(`#${normalizeStateName(lineData[DataProps.state])}Line`)
        .transition()
        .attr('stroke', 'orange')
        .attr('stroke-width', 3.5);
}

/**
 * Removes the label from the line extracted from ``event.target``
 * and the highlighting.
 * @param lineData {{State: string, Values: number[],}}
 */
function deactivateLine(lineData) {
    d3.select(`#${normalizeStateName(lineData.State)}Label`).remove();
    d3.select(`#${normalizeStateName(lineData[DataProps.state])}Line`)
        .transition()
        .attr('stroke', '#2A6595')
        .attr('stroke-width', 1.75);
}

function drawLines(
    data,
    tag,
    xScale,
    yScale,
    onClick = () => {},
    onMouseover = () => {},
    onMouseout = () => {},
    withClip = true
) {
    const lines = tag
        .selectAll('.line')
        .data(data)
        .join('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', '#2A6595')
        .attr('stroke-width', 1.75)
        // Create a line for each ``element`` in ``data``
        .attr('d', (element) =>
            d3
                .line()
                .curve(d3.curveNatural)
                // ``val`` is a single element of ``element[DataProps.values]``
                .x((val, idx) => xScale(startYear + idx))
                .y((val) => yScale(val))(element[DataProps.values])
        )
        .attr(
            'id',
            (element) => `${normalizeStateName(element[DataProps.state])}Line`
        )
        .on('click', onClick)
        .on('mouseover', onMouseover)
        .on('mouseout', onMouseout);

    if (withClip) lines.attr('clip-path', 'url(#clip)');
}

function drawLineChart(tag, data) {
    tag.selectAll('*').remove();
    const layout = calculateLayout(
        lineChartHeightPct,
        lineChartWidthPct,
        paddingPct,
        marginPct
    );

    // Create margins
    const chart = tag
        .append('g')
        .attr(
            'transform',
            `translate(${layout[LayoutProps.margin]}, ${
                layout[LayoutProps.margin]
            })`
        );

    // Use a clipPath so that objects outside this area won't get rendered
    tag.append('defs')
        .append('svg:clipPath')
        .attr('id', 'clip')
        .append('svg:rect')
        .attr('width', layout[LayoutProps.width])
        .attr('height', layout[LayoutProps.height])
        .attr('x', 0)
        .attr('y', -5);

    // Create the horizontal scale and axis
    const xScale = createXScale(layout);
    const xAxis = createXAxis(xScale);
    const xAxisTag = appendXAxis(layout, xAxis, chart);
    // Label the x-axis
    chart
        .append('text')
        .text('Years')
        .attr('font-weight', 'bold')
        .style('font-size', `${1.25 * layout[LayoutProps.fontSize]}px`)
        .attr('text-anchor', 'middle')
        .attr('x', layout[LayoutProps.width] / 2)
        .attr(
            'y',
            layout[LayoutProps.height] + 0.65 * layout[LayoutProps.margin]
        );

    // Create the vertical scale and axis
    const yScale = createYScale(layout, data);
    const yAxis = createYAxis(yScale);
    const yAxisTag = appendYAxis(layout, yAxis, chart);
    // Label the y-axis
    chart
        .append('text')
        .text('Nominal GDP (Millions of current dollars)')
        .attr('font-weight', 'bold')
        .style('font-size', `${1.25 * layout[LayoutProps.fontSize]}px`)
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(layout[LayoutProps.height] / 2))
        .attr('y', -0.75 * layout[LayoutProps.margin]);

    // Define interactivity for the lines

    /**
     * The function that gets invoked on ``click``.
     * @param event
     * @param lineData {{State: string, Values: number[],}}
     */
    function lineClick(event, lineData) {
        markLineAsPermanentlyActive(lineData);
        activateLine(chart, layout, xScale, yScale, lineData);
        permanentlySelectedData.push(lineData);
    }

    /**
     * The function that gets invoked on ``mouseover``.
     * @param event
     * @param lineData {{State: string, Values: number[],}}
     */
    function lineMouseover(event, lineData) {
        activateLine(chart, layout, xScale, yScale, lineData);
    }

    /**
     * The function that gets invoked on ``mouseout``.
     * @param event
     * @param lineData {{State: string, Values: number[],}}
     */
    function lineMouseout(event, lineData) {
        // Do not deactivate lines that are marked as 'permanently active'
        if ([...event.target.classList].includes('permanently-active')) {
            return;
        }
        deactivateLine(lineData);
    }

    // Create the lines
    drawLines(
        data,
        chart,
        xScale,
        yScale,
        lineClick,
        lineMouseover,
        lineMouseout
    );

    permanentlySelectedData.forEach((lineData) => {
        markLineAsPermanentlyActive(lineData);
        activateLine(chart, layout, xScale, yScale, lineData);
    });

    return {
        xScale,
        xAxis,
        xAxisTag,
        yScale,
        yAxis,
        yAxisTag,
        chart,
        lineClick,
        lineMouseover,
        lineMouseout
    };
}

function drawBrushableArea(tag, data, lineChartProps) {
    tag.selectAll('*').remove();
    const layout = calculateLayout(
        brushHeightPct,
        brushWidthPct,
        paddingPct * 0.1,
        marginPct * 0.3
    );

    // Access properties of the line chart to be used for the brushing
    const {
        xScale: lineChartXScale,
        xAxis: lineChartXAxis,
        xAxisTag: lineChartXAxisTag,
        yScale: lineChartYScale,
        chart: lineChart,
        lineClick,
        lineMouseover,
        lineMouseout
    } = lineChartProps;

    // Create margins
    const brushArea = tag
        .append('g')
        .attr(
            'transform',
            `translate(${layout[LayoutProps.margin]}, ${
                layout[LayoutProps.margin]
            })`
        );

    // Create the brushable region
    const [[x0, y0], [x1, y1]] = [
        [0, 0],
        [layout[LayoutProps.width], layout[LayoutProps.height]]
    ];
    const brush = d3
        .brushX()
        .extent([
            [x0, y0],
            [x1, y1]
        ])
        .on('end', updateLineChart);
    brushArea.attr('class', 'brush').call(brush);

    // Create the horizontal scale and axis
    const xScale = createXScale(layout);
    const xAxis = createXAxis(xScale);
    appendXAxis(layout, xAxis, brushArea);

    // Create the lines
    drawLines(
        data,
        brushArea,
        xScale,
        createYScale(layout, data),
        () => {},
        () => {},
        () => {},
        false
    );

    let idleTimeout;
    const idled = () => (idleTimeout = null);

    function updateLineChart(event) {
        const extent = event.selection;
        // If we have no selection, let's jump back to the initial domain
        if (!extent) {
            if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
            lineChartXAxis.ticks(endYear - startYear);
            lineChartXScale.domain([startYear, endYear]);
        } else {
            // ``scale.invert`` scales the values back to the domain space
            const [brushedStartYear, brushedEndYear] = extent.map(
                xScale.invert
            );
            lineChartXScale.domain([brushedStartYear, brushedEndYear]);
            // Show only integer-year ticks
            const [low, high] = [
                Math.floor(brushedStartYear),
                Math.round(brushedEndYear)
            ];
            lineChartXAxis.ticks(1 + high - low);
            // Remove the grey brush area as soon as the selection is ended
            brushArea.select('.brush').call(brush.move, null);
        }
        lineChartXAxisTag.transition().duration(1000).call(lineChartXAxis);
        // Remove the old lines and permanent labels
        lineChart.selectAll('.line').remove();
        lineChart.selectAll('.state-label').remove();
        drawLines(
            data,
            lineChart,
            lineChartXScale,
            lineChartYScale,
            lineClick,
            lineMouseover,
            lineMouseout
        );
        permanentlySelectedData.forEach((lineData) => {
            markLineAsPermanentlyActive(lineData);
            activateLine(
                lineChart,
                layout,
                lineChartXScale,
                lineChartYScale,
                lineData
            );
        });
    }
}

/**
 * Act as soon as the DOM is loaded
 */
window.addEventListener('DOMContentLoaded', async () => {
    const data = transformData(await loadData(fileName));

    drawBrushableArea(brushTag, data, drawLineChart(lineChartTag, data));

    // Add responsiveness by listening to window resizes
    window.onresize = () =>
        drawBrushableArea(brushTag, data, drawLineChart(lineChartTag, data));
});
