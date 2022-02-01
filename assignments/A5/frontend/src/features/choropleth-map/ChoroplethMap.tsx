import * as d3 from 'd3';
import { useEffect } from 'react';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { CovidDataItem } from '@models/covid-data-item';
import { FeatureCollection } from 'geojson';
import worldGeoMap, { WorldMapFeatureProps } from '@data/world-geo-map';
import { ValueFn } from 'd3';
import { ColorScheme } from '@models/color-scheme';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { GeoLocation, IsoCode } from '@models/geo-location';

type ChoroplethMapProps = {
    width: number;
    height: number;
    covidData: CovidDataItem[];
};

function ChoroplethMap({ width, height, covidData }: ChoroplethMapProps) {
    const {
        state: { countryList }
    } = useOCDQueryConfig();
    const {
        state: { colorScheme, selectedCountries },
        dispatch
    } = useUserConfig();

    function handleFeatureClick(featureProps: WorldMapFeatureProps) {
        // Check if the country is already selected
        const selection = selectedCountries.find(
            ({ iso_code }) => iso_code === featureProps.adm0_a3
        );
        // If it is not selected, then query the GeoLocation object from the country pool
        if (selection === undefined) {
            const countryToSelect = countryList.find(
                ({ iso_code }) => iso_code === featureProps.adm0_a3
            );
            // If the country is not in the pool, then shown an alert
            if (countryToSelect === undefined) {
                alert(`No data is available for ${JSON.stringify(featureProps)}`);
            } else {
                dispatch({
                    type: 'ADD_TO_SELECTED_COUNTRIES',
                    data: countryToSelect
                });
            }
        } else {
            dispatch({
                type: 'REMOVE_FROM_SELECTED_COUNTRIES',
                data: selection
            });
        }
    }

    function getCountrySelection(featureProps: WorldMapFeatureProps) {
        return selectedCountries.find(({ iso_code }) => iso_code === featureProps.adm0_a3);
    }

    return (
        <ChoroplethMapFragment
            width={width}
            height={height}
            data={covidData}
            geoData={worldGeoMap}
            colorScheme={colorScheme}
            getCountrySelection={getCountrySelection}
            onClick={handleFeatureClick}
        />
    );
}

type ChoroplethMapFragmentProps = {
    width: number;
    height: number;
    data: CovidDataItem[];
    geoData: FeatureCollection;
    colorScheme: ColorScheme;
    getCountrySelection: (featureProps: WorldMapFeatureProps) => undefined | GeoLocation;
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
    colorScheme,
    getCountrySelection,
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

    // Constructs a unique ID for each country path element in the map to allow selection later
    const countryPathId = (isoCode: IsoCode) => {
        return `${rootId}-country-${isoCode}`.toLowerCase();
    };

    // Returns the actual svg element by id
    const countryPathElement = (isoCode: IsoCode) => {
        return d3.select(`#${countryPathId(isoCode)}`);
    };

    function featureFillDefault(featureProps: WorldMapFeatureProps) {
        const countrySelection = getCountrySelection(featureProps);
        if (countrySelection === undefined) {
            return colorScheme.palette.inactive;
        } else {
            return colorScheme.palette.clicked;
        }
    }

    function handleFeatureClick(featureProps: WorldMapFeatureProps) {
        onClick(featureProps);
    }

    function handleFeatureMouseover(featureProps: WorldMapFeatureProps) {
        countryPathElement(featureProps.adm0_a3)
            .transition()
            .style('fill', colorScheme.palette.hovered);
    }

    function handleFeatureMouseout(featureProps: WorldMapFeatureProps) {
        countryPathElement(featureProps.adm0_a3)
            .transition()
            .style('fill', featureFillDefault(featureProps));
    }

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
            // Add id to each path to be able to select it later by iso_code
            .attr('id', (d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                return countryPathId(featureProps.adm0_a3);
            })
            .attr('stroke', colorScheme.palette.stroke)
            .attr('fill', (d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                return featureFillDefault(featureProps);
            })
            // The actual SVG path that makes up the map
            .attr('d', d3.geoPath(projection) as ValueFn<any, any, any>)
            .on('click', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                handleFeatureClick(featureProps);
            })
            .on('mouseover', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                handleFeatureMouseover(featureProps);
            })
            .on('mouseout', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                handleFeatureMouseout(featureProps);
            });

        // Cleanup after unmount
        return cleanD3Elements;
    }, [width, height, data, geoData]);

    return (
        <div
            id={rootId}
            style={{ backgroundColor: colorScheme.palette.background }}
            className="rounded-b-lg"
        />
    );
}

export default ChoroplethMap;
