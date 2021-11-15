import * as d3 from 'd3';
import { useEffect } from 'react';
import { ColorScheme } from '@models/color-scheme';
import { bivariateColorScheme } from '@models/color-scheme';
import usStates from '@data/us-states-geo.json';
import useWindowSize from '@hooks/useWindowSize';
import useBivariateColorGenerator from '@hooks/useBivariateColorGenerator';
import { ValueFn } from 'd3-selection';
import { GeoFeature } from '@models/geo-feature';
import { useAppData } from '@components/AppDataProvider/app-data-context';
import { getStateDataValue, getStateDataValues, stateDataExists } from '@utils/app-data-utils';

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
    const [mapWidth, mapHeight] = [0.475 * width!, 0.7 * height!];
    const {
        state: { selectedYear, personalIncome, educationRates }
    } = useAppData();
    const colorGen = useBivariateColorGenerator(colorScheme);
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
            .attr('stroke', '#5d5d5d')
            // The actual SVG path that makes up the map
            .attr('d', d3.geoPath(projection) as ValueFn<any, any, any>)
            // Set the fill color dynamically
            .attr('fill', (d) => {
                // Quick cast to access the props in a typed way
                const feature = d as GeoFeature;
                const {
                    properties: { name: stateName }
                } = feature;
                // Generate a color dynamically only for valid state names
                if (
                    stateDataExists(educationRates, stateName) &&
                    stateDataExists(personalIncome, stateName)
                ) {
                    // x: educational attainment rate, y: average personal yearly income
                    const coordinate = {
                        x: getStateDataValue(educationRates, stateName, selectedYear),
                        y: getStateDataValue(personalIncome, stateName, selectedYear)
                    };
                    return colorGen(coordinate);
                }
                // Return a default color for features with unrecognized name
                return '#333333';
            });
    });
    return <div id={slug} className="bg-white" />;
}
