import * as d3 from 'd3';
import { useEffect } from 'react';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { CovidDataItem } from '@models/covid-data-item';
import { FeatureCollection } from 'geojson';
import worldGeoMap, { WorldMapFeatureProps } from '@data/world-geo-map';
import { ValueFn } from 'd3';

type ChoroplethMapProps = {
    width: number;
    height: number;
    covidData: CovidDataItem[];
};

function ChoroplethMap({ width, height, covidData }: ChoroplethMapProps) {
    const { dispatch } = useUserConfig();

    function handleFeatureClick(featureProps: WorldMapFeatureProps) {}

    return (
        <ChoroplethMapFragment
            width={width}
            height={height}
            data={covidData}
            geoData={worldGeoMap}
            onClick={handleFeatureClick}
        />
    );
}

type ChoroplethMapFragmentProps = {
    width: number;
    height: number;
    data: CovidDataItem[];
    geoData: FeatureCollection;
    rootId?: string;
    tooltipId?: string;
    margin?: number;
    onClick?: (featureProps: WorldMapFeatureProps) => void;
};

function ChoroplethMapFragment({
    width,
    height,
    data,
    geoData,
    rootId = 'choropleth-map',
    tooltipId = 'choropleth-map-tooltip',
    margin = 7.5,
    onClick = (featureProps) => console.log(featureProps, 'clicked')
}: ChoroplethMapFragmentProps) {
    const mapWidth = width - 2 * margin;
    const mapHeight = height - 2 * margin;

    const cleanD3Elements = () => {
        // Make sure that the only SVG tag inside the root div is the map
        d3.select(`#${rootId}`).selectAll('*').remove();
        d3.select(`#${tooltipId}`).remove();
    };

    useEffect(() => {
        // tooltip
        d3.select('body')
            .append('div')
            .attr('id', `${tooltipId}`)
            .attr('style', 'position: absolute; opacity: 0;')
            .attr('class', 'p-2 bg-primary rounded-md text-white text-xs');

        // Create the SVG element of the map
        const svg = d3
            .select(`#${rootId}`)
            .append('svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

        // Create the map projection
        const projection = d3.geoNaturalEarth1().fitSize([mapWidth, mapHeight], geoData);

        // Create the map from the geoData features
        svg.selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('stroke', '#5d5d5d')
            // The actual SVG path that makes up the map
            .attr('d', d3.geoPath(projection) as ValueFn<any, any, any>)
            // Handle click
            .on('click', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                onClick(featureProps);
            })
            // Handle tooltips
            .on('mouseover', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                console.log(featureProps, 'mouseover');
            })
            .on('mouseout', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                console.log(featureProps, 'mouseout');
            });

        // Cleanup after unmount
        return cleanD3Elements;
    }, [width, height, data, geoData]);

    return <div id={rootId} />;
}

export default ChoroplethMap;
