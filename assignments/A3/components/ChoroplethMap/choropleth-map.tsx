import * as d3 from 'd3';
import { useEffect } from 'react';
import { ColorScheme } from '@models/color-scheme';
import { bivariateColorScheme } from '@models/color-scheme';
import usStates from '@data/us-states-geo.json';
import useWindowSize from '@hooks/useWindowSize';
import { ValueFn } from 'd3-selection';

type ChoroplethMapProps = {
    slug: string;
    colorScheme: ColorScheme;
    geoData: any;
};

const usaMapDefaultProps: ChoroplethMapProps = {
    slug: 'usa-choropleth',
    colorScheme: bivariateColorScheme,
    geoData: usStates
};

export default function ChoroplethMap(): JSX.Element {
    const { slug, colorScheme, geoData } = usaMapDefaultProps;
    const { width, height } = useWindowSize();
    const [mapWidth, mapHeight] = [0.48 * width!, 0.7 * height!];
    useEffect(() => {
        // Do not start the rendering before the map dimensions are set
        if (!(mapWidth && mapHeight)) return;
        // Make sure that the only SVG tag inside the root div is the map
        d3.select(`#${slug}`).selectAll('*').remove();

        // Create the SVG element of the map
        const svg = d3
            .select(`#${slug}`)
            .append('svg')
            .attr('width', `${mapWidth}px`)
            .attr('height', `${mapHeight}px`);

        // Create the map projection
        const projection = d3.geoAlbersUsa().fitSize([mapWidth, mapHeight], geoData);

        // Create the map from the geoData features
        svg.selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('fill', '#eeeeee')
            .attr('stroke', '#bbb')
            // The actual SVG path that makes up the map
            .attr('d', d3.geoPath(projection) as ValueFn<any, any, any>);
    });
    return <div id={slug} className="bg-white"></div>;
}
