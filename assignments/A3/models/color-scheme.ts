import { Coordinate } from '@models/coordinate';
import { ScaleQuantile } from 'd3-scale';

export type ColorScheme = {
    name: string;
    colors: string[];
};

export type ColorGenProps = {
    gen: ({ x, y }: Coordinate) => string;
    scales: { xScale: ScaleQuantile<number>; yScale: ScaleQuantile<number> };
};

export const bivariateColorScheme: ColorScheme = {
    name: 'GnBu',
    colors: [
        '#e8e8e8',
        '#e4d9ac',
        '#c8b35a',
        '#cbb8d7',
        '#c8ada0',
        '#af8e53',
        '#9972af',
        '#976b82',
        '#804d36'
    ]
};
