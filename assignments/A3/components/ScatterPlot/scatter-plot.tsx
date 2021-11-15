import * as d3 from 'd3';
import { useEffect } from 'react';
import { ColorScheme } from '@models/color-scheme';
import { bivariateColorScheme } from '@models/color-scheme';
import useWindowSize from '@hooks/useWindowSize';
import { useAppData } from '@components/AppDataProvider/app-data-context';
import { getStateDataValue } from '@utils/app-data-utils';
import { Coordinate } from '@models/coordinate';

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
    const { width, height } = useWindowSize();
    const [plotWidth, plotHeight] = [0.475 * width!, 0.7 * height!];
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

    useEffect(() => {
        // Do not start the rendering before the plot dimensions are set
        if (!(plotWidth && plotHeight)) return;
        // Make sure that the only SVG tag inside the root div is the plot
        d3.select(`#${slug}`).selectAll('*').remove();

        const xScale = d3.scaleLinear().range([0, plotWidth]);
        const yScale = d3.scaleLinear().range([plotHeight, 0]);

        // Create the SVG element of the plot
        const svg = d3
            .select(`#${slug}`)
            .append('svg')
            .attr('width', `${plotWidth}px`)
            .attr('height', `${plotHeight}px`);
    });
    return <div id={slug} className="bg-white" />;
}
