import * as d3 from 'd3';
import { useEffect } from 'react';
import { ColorScheme } from '@models/color-scheme';
import { bivariateColorScheme } from '@models/color-scheme';
import useWindowSize from '@hooks/useWindowSize';
import { useAppData } from '@components/AppDataProvider/app-data-context';
import { getStateDataValue, getStateDataValues } from '@utils/app-data-utils';
import { Coordinate } from '@models/coordinate';
import useBivariateColorGenerator from '@hooks/useBivariateColorGenerator';

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
    const [plotWidth, plotHeight] = [0.35 * width!, 0.35 * width!];
    const margin = 50;
    const {
        state: { selectedYear, personalIncome, educationRates }
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

    // Id of the tooltip to be displayed on marker hover
    const tooltipId = `${slug}-tooltip`;

    // Generate marker colors
    const {
        gen: colorGen,
        scales: { x: cgXScale, y: cgYScale }
    } = useBivariateColorGenerator(colorScheme);

    useEffect(() => {
        // Do not start the rendering before the plot dimensions are set
        if (!(plotWidth && plotHeight)) return;
        // Make sure that the only SVG tag inside the root div is the plot
        d3.select(`#${slug}`).selectAll('*').remove();
        d3.select(`#${tooltipId}`).remove();

        // tooltip
        d3.select('body')
            .append('div')
            .attr('id', `${slug}-tooltip`)
            .attr('style', 'position: absolute; opacity: 0;');

        // Create the SVG element of the plot
        const svg = d3
            .select(`#${slug}`)
            .append('svg')
            .attr('width', `${plotWidth + 2 * margin}px`)
            .attr('height', `${plotHeight + 2 * margin}px`)
            .append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

        // x-axis
        const xScale = d3
            .scaleLinear()
            .domain([0.9 * xValues[0], 1.1 * xValues[xValues.length - 1]])
            .range([0, plotWidth]);
        const xAxis = d3.axisBottom(xScale);
        const gX = svg
            .append('g')
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
        const yScale = d3
            .scaleLinear()
            .domain([0.9 * yValues[0], 1.1 * yValues[yValues.length - 1]])
            .range([plotHeight - 50, 0]);
        const yAxis = d3.axisLeft(yScale).tickFormat(d3.format('$.2s'));
        const gY = svg.append('g').call(yAxis);
        // y-axis label
        gY.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', 0)
            .attr('y', -40)
            .style('text-anchor', 'end')
            .style('fill', '#000000')
            .style('font-weight', 'bold')
            .text('Mean Yearly Income');

        const background = svg.append('g');
        const d = d3.pairs(
            d3.merge([[yScale.domain()[0]], colorScheme.colors, [yScale.domain()[1]]])
        );

        // x-y markers
        svg.append('g')
            .selectAll('circle')
            .data(scatterData)
            .enter()
            .append('circle')
            .attr('cx', ({ coordinate: { x } }) => xScale(x))
            .attr('cy', ({ coordinate: { y } }) => yScale(y))
            .attr('r', 6)
            .style('fill', ({ coordinate }) => colorGen(coordinate))
            .style('stroke', '#000000')
            .style('opacity', 0.5)
            .on('mouseover', (event, { state }) => {
                d3.select(`#${tooltipId}`)
                    .style('display', 'block')
                    .style('left', `${event.pageX - 30}px`)
                    .style('top', `${event.pageY - 30}px`)
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
                    .text(state)
                    .style('font-size', '14px');
            })
            .on('mouseout', () => {
                d3.select(`#${tooltipId}`).style('display', 'none').style('opacity', 0);
            });
    });
    return <div id={slug} className="bg-white flex justify-center items-center" />;
}
