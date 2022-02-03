// Each color is represented as a hex value
type ColorPalette = {
    scale: string[];
    hovered: string;
    clicked: string;
    inactive: string;
    unavailable: string;
    background: string;
    stroke: string;
};

export type ColorScheme = {
    name: string;
    description: string;
    palette: ColorPalette;
};

/* Scales taken from https://observablehq.com/@d3/bivariate-choropleth */
export const colorSchemes: ColorScheme[] = [
    {
        name: 'RdBu',
        description: 'Dark, semi-vivid colors',
        palette: {
            scale: [
                '#e8e8e8',
                '#e4acac',
                '#c85a5a',
                '#b0d5df',
                '#ad9ea5',
                '#985356',
                '#64acbe',
                '#627f8c',
                '#574249'
            ],
            hovered: '#DBD56E',
            clicked: '#ffc285',
            inactive: '#3e3e3e',
            unavailable: '#0B2027',
            background: '#403D58',
            stroke: '#FC7753'
        }
    },
    {
        name: 'BuPu',
        description: 'Light, sharp colors',
        palette: {
            scale: [
                '#e8e8e8',
                '#ace4e4',
                '#5ac8c8',
                '#dfb0d6',
                '#a5add3',
                '#5698b9',
                '#be64ac',
                '#8c62aa',
                '#3b4994'
            ],
            hovered: '#EB4B98',
            clicked: '#5158BB',
            inactive: '#F6F0ED',
            unavailable: '#272D2D',
            background: '#ffffff',
            stroke: '#A846A0'
        }
    },
    {
        name: 'GnBu',
        description: 'Darker, less saturated colors',
        palette: {
            scale: [
                '#e8e8e8',
                '#b5c0da',
                '#6c83b5',
                '#b8d6be',
                '#90b2b3',
                '#567994',
                '#73ae80',
                '#5a9178',
                '#2a5a5b'
            ],
            hovered: '#EFC88B',
            clicked: '#B6CCA1',
            inactive: '#3e3e3e',
            unavailable: '#30011E',
            background: '#050517',
            stroke: '#CF5C36'
        }
    },
    {
        name: 'PuOr',
        description: 'Darker, more saturated colors',
        palette: {
            scale: [
                '#e8e8e8',
                '#e4d9ac',
                '#c8b35a',
                '#cbb8d7',
                '#c8ada0',
                '#af8e53',
                '#9972af',
                '#976b82',
                '#804d36'
            ],
            hovered: '#B6465F',
            clicked: '#E56B70',
            inactive: '#361134',
            unavailable: '#6B0F1A',
            background: '#2C0703',
            stroke: '#B0228C'
        }
    }
];
