import { Coordinate } from '@models/coordinate';
import { ScaleQuantile } from 'd3-scale';

export type ColorScheme = {
    name: string;
    colors: string[];
};

export type ColorGenProps = {
    scales: { x: ScaleQuantile<number, never>; y: ScaleQuantile<number, never> };
    gen: ({ x, y }: Coordinate) => string;
};

export const bivariateColorScheme: ColorScheme = {
    name: 'GnBu',
    colors: [
        '#e8e8e8',
        '#b5c0da',
        '#6c83b5',
        '#b8d6be',
        '#90b2b3',
        '#567994',
        '#73ae80',
        '#5a9178',
        '#2a5a5b'
    ]
};
