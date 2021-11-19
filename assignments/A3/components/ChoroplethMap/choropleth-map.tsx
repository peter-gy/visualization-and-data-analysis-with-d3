import * as d3 from 'd3';
import { useEffect } from 'react';
import usStates from '@data/us-states-geo.json';
import useWindowSize from '@hooks/useWindowSize';
import { ValueFn } from 'd3-selection';
import { GeoFeature } from '@models/geo-feature';
import { useAppData } from '@components/AppDataProvider/app-data-context';
import { getStateDataValue, stateDataExists } from '@utils/app-data-utils';
import useBivariateColorGenerator from '@hooks/useBivariateColorGenerator';
import useMediaQuery from '@hooks/useMediaQuery';

type ChoroplethMapProps = {
    slug: string;
    geoData: any;
};

const usaMapDefaultProps: ChoroplethMapProps = {
    slug: 'usa-choropleth',
    geoData: usStates
};

export default function ChoroplethMap(): JSX.Element {
    const { width } = useWindowSize();
    const screenIsMinMd = useMediaQuery('(min-width: 768px)');
    const multiplier = screenIsMinMd ? 0.35 : 0.6;
    const [mapWidth, mapHeight] = [multiplier * width!, multiplier * width!];
    const margin = 5;
    const {
        state: { selectedYear, personalIncome, educationRates, selectedStates, colorScheme },
        dispatch
    } = useAppData();
    const { slug, geoData } = usaMapDefaultProps;
    const { gen: colorGen } = useBivariateColorGenerator(colorScheme);
    const tooltipId = `${slug}-tooltip`;
    useEffect(() => {
        // Do not start the rendering before the map dimensions are set
        if (!(mapWidth && mapHeight)) return;
        // Make sure that the only SVG tag inside the root div is the map
        d3.select(`#${slug}`).selectAll('*').remove();
        d3.select(`#${tooltipId}`).remove();

        // tooltip
        d3.select('body')
            .append('div')
            .attr('id', `${tooltipId}`)
            .attr('style', 'position: absolute; opacity: 0;')
            .attr('class', 'p-2 bg-primary rounded-md text-white text-xs');

        // Create the SVG element of the map
        const svg = d3
            .select(`#${slug}`)
            .append('svg')
            .attr('width', `${mapWidth + 2 * margin}px`)
            .attr('height', `${mapHeight + 2 * margin}px`)
            .append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

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
                // Gray out unselected states
                if (!selectedStates.includes(stateName)) return '#fdfcfc';
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
            })
            .on('click', (e, d) => {
                // Quick cast to access the props in a typed way
                const feature = d as GeoFeature;
                const {
                    properties: { name: stateName }
                } = feature;
                dispatch({
                    type: selectedStates.includes(stateName) ? 'deselectState' : 'selectState',
                    data: stateName
                });
            })
            .on('mouseover', (event, d) => {
                const feature = d as GeoFeature;
                const {
                    properties: { name: stateName }
                } = feature;
                d3.select(`#${tooltipId}`)
                    .style('display', 'block')
                    .style('left', `${event.pageX - 50}px`)
                    .style('top', `${event.pageY - 50}px`)
                    .style('opacity', 1)
                    .text(stateName)
                    .style('font-size', '14px');
            })
            .on('mouseout', () => {
                d3.select(`#${tooltipId}`).style('display', 'none').style('opacity', 0);
            });
    });
    return (
        <div
            id={slug}
            onClick={() => dispatch({ type: 'setSelectedStates', data: [] })}
            className="bg-white flex justify-center items-center"
        />
    );
}
