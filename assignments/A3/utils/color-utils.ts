/* This generator was inspired by https://observablehq.com/@d3/bivariate-choropleth */
import * as d3 from 'd3';
import { ColorGenProps, ColorScheme } from '@models/color-scheme';
import { Coordinate } from '@models/coordinate';

export function bivariateColorGenerator(
    colorScheme: ColorScheme,
    values: { x: number[]; y: number[] }
): ColorGenProps {
    // Make sure that we'll get a square number
    const n = Math.floor(Math.sqrt(colorScheme.colors.length));
    const xScale = d3.scaleQuantile().domain([d3.min(values.x), d3.max(values.x)]).range(d3.range(n));
    const yScale = d3.scaleQuantile().domain([d3.min(values.y), d3.max(values.y)]).range(d3.range(n));
    return {
        gen: ({ x, y }: Coordinate) => colorScheme.colors[xScale(x) + n * yScale(y)],
        scales: { xScale, yScale }
    };
}
