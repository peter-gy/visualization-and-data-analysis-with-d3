import * as d3 from 'd3';
import { useEffect } from 'react';
import { ColorScheme } from '@models/color-scheme';
import { bivariateColorScheme } from '@models/color-scheme';
import useWindowSize from '@hooks/useWindowSize';
import { useAppData } from '@components/AppDataProvider/app-data-context';
import { getStateDataValue, getStateDataValues } from '@utils/app-data-utils';
import { Coordinate } from '@models/coordinate';
import useBivariateColorGenerator from '@hooks/useBivariateColorGenerator';
import useMediaQuery from '@hooks/useMediaQuery';

type ScatterPlotProps = {
    slug: string;
    colorScheme: ColorScheme;
};

const usaScatterPlotDefaultProps: ScatterPlotProps = {
    slug: 'usa-scatter',
    colorScheme: bivariateColorScheme
};

export default function ScatterPlot(): JSX.Element {
    const { slug, colorScheme } = usaScatterPlotDefaultProps;
    const { width } = useWindowSize();
    const screenIsMinMd = useMediaQuery('(min-width: 768px)');
    const multiplier = screenIsMinMd ? 0.3 : 0.5;
    const [plotWidth, plotHeight] = [multiplier * width!, multiplier * width!];
    const margin = 50;
    const {
        state: { selectedYear, personalIncome, educationRates, selectedStates },
        dispatch
    } = useAppData();
    // Make sure that we can actually 'zip' the data
    if (personalIncome.length !== educationRates.length)
        throw new Error('The length of the datasets are not equal');
    // Data to be used for the scatter plot
    const scatterData: { state: string; coordinate: Coordinate }[] = personalIncome.map(
        ({ state: stateName }) => ({
            state: stateName,
            coordinate: {
                x: getStateDataValue(educationRates, stateName, selectedYear),
                y: getStateDataValue(personalIncome, stateName, selectedYear)
            }
        })
    );
    // Get the sorted values to set the axes properly
    const xValues = getStateDataValues(educationRates, selectedYear).sort();
    const yValues = getStateDataValues(personalIncome, selectedYear).sort();

    function getXScale(plotWidth: number, plotHeight: number) {
        return d3
            .scaleLinear()
            .domain([xValues[0], xValues[xValues.length - 1]])
            .range([0, plotWidth]);
    }

    function getYScale(plotWidth: number, plotHeight: number) {
        return d3
            .scaleLinear()
            .domain([yValues[0], yValues[yValues.length - 1]])
            .range([plotHeight - 50, 0]);
    }

    // Id of the tooltip to be displayed on marker hover
    const tooltipId = `${slug}-tooltip`;

    const { scales: colorScales } = useBivariateColorGenerator(colorScheme);

    useEffect(() => {
        if (!(plotWidth && plotHeight)) return;
        d3.select(`#${slug}`).selectAll('*').remove();
        d3.select(`#${slug}`)
            .append('svg')
            .attr('id', `${slug}-root`)
            .attr('width', `${plotWidth + 2 * margin}px`)
            .attr('height', `${plotHeight + 2 * margin}px`)
            .append('g')
            .attr('id', `${slug}-group`)
            .attr('transform', `translate(${margin}, ${margin})`);
    }, [plotWidth, plotHeight]);

    useEffect(() => {
        // Do not start the rendering before the plot dimensions are set
        if (!(plotWidth && plotHeight)) return;
        ['background', 'gX', 'gY', 'markers']
            .map((id) => d3.select(`#${id}`))
            .forEach((node) => node.remove());
        d3.select(`#${tooltipId}`).remove();

        // tooltip
        d3.select('body')
            .append('div')
            .attr('id', `${tooltipId}`)
            .attr('style', 'position: absolute; opacity: 0;')
            .attr('class', 'p-2 bg-primary rounded-md text-white text-xs');

        const xScale = getXScale(plotWidth, plotHeight);
        const yScale = getYScale(plotWidth, plotHeight);

        // Create the SVG element of the plot
        const svg = d3.select(`#${slug}-group`);

        // Background grid
        const n = 3;
        const grid = d3.cross(d3.range(n), d3.range(n));

        // Calculate the grid tile widths based on the color quantile scales
        const tileWidths = d3
            .range(n)
            .map(colorScales.xScale.invertExtent)
            .map((e) => xScale(e[1]) - xScale(e[0]));
        const tileHeights = d3
            .range(n)
            .map(colorScales.yScale.invertExtent)
            .map((e) => yScale(e[0]) - yScale(e[1]));

        // get the total height of the grid to be used to calculate the y coordinates
        const totalH = tileHeights.reduce((a, b) => a + b, 0);

        // utility function to get the tile dimensions
        function dim(i: number, j: number): [w: number, h: number] {
            return [tileWidths[i], tileHeights[j]];
        }

        // utility function to get the tile coordinates
        function coord(i: number, j: number): [x: number, y: number] {
            // sum of the preceeding tiles' widths
            const x = tileWidths.slice(0, i).reduce((acc, currW) => acc + currW, 0);
            // totalH - sum of the preceeding tiles' heights + the current tile's height
            // (0, 0) is the top left corner of the grid
            const y = totalH - tileHeights.slice(0, j + 1).reduce((acc, currH) => acc + currH, 0);
            return [x, y];
        }

        svg.append('g')
            .attr('id', 'background')
            .selectAll('rect')
            .data(grid)
            .enter()
            .append('rect')
            .attr('fill', ([i, j]) => colorScheme.colors[j * n + i])
            .attr('width', ([i, j]) => dim(i, j)[0])
            .attr('height', ([i, j]) => dim(i, j)[1])
            .attr('x', ([i, j]) => coord(i, j)[0])
            .attr('y', ([i, j]) => coord(i, j)[1])
            .attr('coord', ([i, j]) => `[${i};${j}]`);

        // x-axis
        const xAxis = d3.axisBottom(xScale).tickFormat((d) => `${d}%`);
        const gX = svg
            .append('g')
            .attr('id', 'gX')
            .attr('transform', `translate(0, ${plotHeight - 50})`)
            .call(xAxis);
        // x-axis label
        gX.append('text')
            .attr('x', plotWidth)
            .attr('y', 40)
            .style('text-anchor', 'end')
            .style('fill', '#000000')
            .style('font-weight', 'bold')
            .text('Educational Attainment Rate');

        // y-axis
        const yAxis = d3.axisLeft(yScale).tickFormat(d3.format('$.2s'));
        const gY = svg.append('g').attr('id', 'gY').call(yAxis);
        // y-axis label
        gY.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', 0)
            .attr('y', -40)
            .style('text-anchor', 'end')
            .style('fill', '#000000')
            .style('font-weight', 'bold')
            .text('Mean Yearly Income');

        // x-y markers
        d3.select(`#${slug}-root`)
            .append('g')
            .attr('transform', `translate(${margin}, ${margin})`)
            .attr('id', 'markers')
            .selectAll('circle')
            .data(scatterData)
            .enter()
            .append('circle')
            .attr('cx', ({ coordinate: { x } }) => xScale(x))
            .attr('cy', ({ coordinate: { y } }) => yScale(y))
            .attr('r', ({ state }) => (selectedStates.includes(state) ? 5 : 4))
            .style('fill', ({ state }) => (selectedStates.includes(state) ? '#c5311d' : '#000000'))
            .style('stroke', '#ffffff')
            .style('stroke-width', ({ state }) => (selectedStates.includes(state) ? 2 : 1))
            .style('opacity', ({ state }) => (selectedStates.includes(state) ? 1.0 : 0.8))
            .on('mouseover', (event, { state, coordinate: { x, y } }) => {
                d3.select(`#${tooltipId}`)
                    .style('display', 'block')
                    .style('left', `${event.pageX - 50}px`)
                    .style('top', `${event.pageY - 55}px`)
                    .style('opacity', 1)
                    .text(`${state} (${x}%, $${y})`)
                    .style('font-size', '14px');
            })
            .on('mouseout', () => {
                d3.select(`#${tooltipId}`).style('display', 'none').style('opacity', 0);
            });
    });

    useEffect(() => {
        if (!(plotWidth && plotHeight)) return;
        const xScale = getXScale(plotWidth, plotHeight);
        const yScale = getYScale(plotWidth, plotHeight);
        // Brush control
        const brush = d3
            .brush()
            .extent([
                [0, 0],
                [plotWidth, plotHeight - 50]
            ])
            .on('start brush', (e) => {
                const selection = e.selection;
                if (!selection) {
                    dispatch({ type: 'setSelectedStates', data: [] });
                    return;
                }
                const [x0, x1] = [xScale.invert(selection[0][0]), xScale.invert(selection[1][0])];
                const [y0, y1] = [yScale.invert(selection[1][1]), yScale.invert(selection[0][1])];
                const selectedStates = educationRates
                    .filter(({ state }) => {
                        const xVal = getStateDataValue(educationRates, state, selectedYear);
                        const yVal = getStateDataValue(personalIncome, state, selectedYear);
                        return xVal >= x0 && xVal <= x1 && yVal >= y0 && yVal <= y1;
                    })
                    .map(({ state }) => state);
                dispatch({ type: 'setSelectedStates', data: selectedStates });
            });
        // Add the brush area to the SVG tag
        const brushGroup = d3.select(`#${slug}-root`)
            .append('g')
            .attr('transform', `translate(${margin}, ${margin})`)
            .attr('class', 'brush')
            .call(brush);
    }, [plotWidth, plotHeight]);
    return <div id={slug} className="bg-white flex justify-center items-center" />;
}
