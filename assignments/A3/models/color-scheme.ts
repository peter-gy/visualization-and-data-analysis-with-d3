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

/* Schemes taken from https://observablehq.com/@d3/bivariate-choropleth */
export const colorSchemes: ColorScheme[] = [
    {
        name: 'RdBu',
        colors: [
            '#e8e8e8',
            '#e4acac',
            '#c85a5a',
            '#b0d5df',
            '#ad9ea5',
            '#985356',
            '#64acbe',
            '#627f8c',
            '#574249'
        ]
    },
    {
        name: 'BuPu',
        colors: [
            '#e8e8e8',
            '#ace4e4',
            '#5ac8c8',
            '#dfb0d6',
            '#a5add3',
            '#5698b9',
            '#be64ac',
            '#8c62aa',
            '#3b4994'
        ]
    },
    {
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
    },
    {
        name: 'PuOr',
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
    }
];
