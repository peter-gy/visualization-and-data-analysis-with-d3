import * as d3 from 'd3';
import { ColorGenProps, ColorScheme } from '@models/color-scheme';
import { Coordinate } from '@models/coordinate';

export function bivariateColorGenerator(
    colorScheme: ColorScheme,
    values: { x: number[]; y: number[] }
): ColorGenProps {
    // Make sure that we'll get a square number
    const n = Math.floor(Math.sqrt(colorScheme.colors.length));
    // Setup quantiles for the x and y values
    const xQuantile = d3.scaleQuantile().domain(values.x).range(d3.range(n));
    const yQuantile = d3.scaleQuantile().domain(values.y).range(d3.range(n));
    return {
        scales: {
            x: xQuantile,
            y: yQuantile
        },
        gen: ({ x, y }: Coordinate) => colorScheme.colors[xQuantile(x) * n + yQuantile(y)]
    };
}
