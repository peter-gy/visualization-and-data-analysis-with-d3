/* This generator was inspired by https://observablehq.com/@d3/bivariate-choropleth */
import { ColorScheme } from '@models/color-scheme';
import * as d3 from 'd3';

function bivariateColorGenerator(colorScheme: ColorScheme, values: { x: number[]; y: number[] }) {
    // Make sure that we'll get a square number
    const colors = colorScheme.palette.scale;
    const n = Math.floor(Math.sqrt(colors.length));
    const xScale = d3
        .scaleQuantile()
        .domain([d3.min(values.x), d3.max(values.x)])
        .range(d3.range(n));
    const yScale = d3
        .scaleQuantile()
        .domain([d3.min(values.y), d3.max(values.y)])
        .range(d3.range(n));
    return {
        gen: ({ x, y }: { x: number; y: number }) => {
            let xVal = xScale(x);
            let yVal = yScale(y);
            return colors[xVal + n * yVal];
        },
        scales: { xScale, yScale }
    };
}

export { bivariateColorGenerator };
