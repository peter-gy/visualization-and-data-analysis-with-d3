import * as d3 from 'd3';
import { useEffect } from 'react';
import { ColorScheme } from '@models/color-scheme';
import { bivariateColorScheme } from '@models/color-scheme';
import useWindowSize from '@hooks/useWindowSize';

type ScatterplotProps = {
    slug: string;
    colorScheme: ColorScheme;
};

const usaScatterPlotDefaultProps: ScatterplotProps = {
    slug: 'usa-scatter',
    colorScheme: bivariateColorScheme
};

export default function ScatterPlot(): JSX.Element {
    const { slug, colorScheme } = usaScatterPlotDefaultProps;
    const { width, height } = useWindowSize();
    const [plotWidth, plotHeight] = [0.48 * width!, 0.7 * height!];
    useEffect(() => {
        // Do not start the rendering before the plot dimensions are set
        if (!(plotWidth && plotHeight)) return;
        // Make sure that the only SVG tag inside the root div is the plot
        d3.select(`#${slug}`).selectAll('*').remove();

        // Create the SVG element of the plot
        const svg = d3
            .select(`#${slug}`)
            .append('svg')
            .attr('width', `${plotWidth}px`)
            .attr('height', `${plotHeight}px`);
    });
    return <div id={slug} className="bg-white"></div>;
}
