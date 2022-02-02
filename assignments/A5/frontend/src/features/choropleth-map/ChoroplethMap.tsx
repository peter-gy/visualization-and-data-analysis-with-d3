import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem } from '@models/covid-data-item';
import { GeoLocation, IsoCode } from '@models/geo-location';
import { bivariateColorGenerator } from '@services/color-gen-service';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { ValueFn } from 'd3';
import { FeatureCollection } from 'geojson';
import { useEffect, useMemo, useState } from 'react';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import worldGeoMap, { WorldMapFeatureProps } from '@data/world-geo-map';

type ChoroplethMapProps = {
    width: number;
    height: number;
    selectedCovidData: CovidDataItem[];
};

function getAggregatedData(covidData: CovidDataItem[]) {
    const dataByIsoCode = groupBy<CovidDataItem, IsoCode>(
        covidData,
        ({ geo_location: { iso_code } }) => iso_code
    );

    return Object.keys(dataByIsoCode)
        .map((key) => key as IsoCode)
        .reduce((acc, key) => {
            const cleanItems = dataByIsoCode[key].filter(
                ({ positive_rate, people_vaccinated_per_hundred }) =>
                    positive_rate !== null && people_vaccinated_per_hundred !== null
            );
            // No clean data found for the country
            if (cleanItems.length === 0) {
                return acc;
            }
            const xMean = d3.mean(cleanItems, ({ positive_rate }) => positive_rate) as number;
            const yMean = d3.mean(
                cleanItems,
                ({ people_vaccinated_per_hundred }) => people_vaccinated_per_hundred
            ) as number;
            return { ...acc, [key]: { x: xMean, y: yMean } };
        }, {} as Record<IsoCode, { x: number; y: number }>);
}

function ChoroplethMap({ width, height, selectedCovidData }: ChoroplethMapProps) {
    const {
        state: { countriesByIsoCode }
    } = useOCDQueryConfig();
    const {
        state: { colorScheme, selectedCountriesByIsoCode },
        dispatch
    } = useUserConfig();

    function handleFeatureClick(featureProps: WorldMapFeatureProps) {
        // Check if the country is already selected
        const selection = selectedCountriesByIsoCode[featureProps.adm0_a3];
        // If it is not selected, then query the GeoLocation object from the country pool
        if (selection === undefined) {
            const countryToSelect = countriesByIsoCode[featureProps.adm0_a3];
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

    function selectedCountry(featureProps: WorldMapFeatureProps) {
        return selectedCountriesByIsoCode[featureProps.adm0_a3];
    }

    function supportedCountry(featureProps: WorldMapFeatureProps) {
        return countriesByIsoCode[featureProps.adm0_a3];
    }
    const meansByIsoCode = useMemo(() => getAggregatedData(selectedCovidData), [selectedCovidData]);
    const bivariateData = Object.keys(meansByIsoCode)
        .map((key) => key as IsoCode)
        .reduce(
            (acc, key) => {
                const { x, y } = meansByIsoCode[key];
                return { x: [...acc.x, x], y: [...acc.y, y] };
            },
            { x: [], y: [] } as { x: number[]; y: number[] }
        );

    return (
        <ChoroplethMapFragment
            width={width}
            height={height}
            selectedCovidData={selectedCovidData}
            meansByIsoCode={meansByIsoCode}
            bivariateData={bivariateData}
            geoData={worldGeoMap}
            colorScheme={colorScheme}
            selectedCountry={selectedCountry}
            supportedCountry={supportedCountry}
            onClick={handleFeatureClick}
        />
    );
}

type ChoroplethMapFragmentProps = {
    width: number;
    height: number;
    selectedCovidData: CovidDataItem[];
    meansByIsoCode: Record<IsoCode, { x: number; y: number }>;
    bivariateData: { x: number[]; y: number[] };
    geoData: FeatureCollection;
    colorScheme: ColorScheme;
    selectedCountry: (featureProps: WorldMapFeatureProps) => undefined | GeoLocation;
    supportedCountry: (featureProps: WorldMapFeatureProps) => undefined | GeoLocation;
    rootId?: string;
    margin?: number;
    onClick?: (featureProps: WorldMapFeatureProps) => void;
};

/**
 * Denotes the data status of a country
 */
type CountryStatus = 'notInDataSet' | 'notSelected' | 'selected' | 'dataUnavailable';

function ChoroplethMapFragment({
    width,
    height,
    selectedCovidData,
    meansByIsoCode,
    bivariateData,
    geoData,
    colorScheme,
    selectedCountry,
    supportedCountry,
    rootId = 'choropleth-map',
    margin = 10,
    onClick = (featureProps) => console.log(featureProps, 'clicked')
}: ChoroplethMapFragmentProps) {
    const [tooltipProps, setTooltipProps] = useState<ChoroplethMapTooltipProps>({
        visible: false,
        xPos: 0,
        yPos: 0,
        featureProps: {} as WorldMapFeatureProps,
        covidDataItem: undefined,
        countryStatus: 'notInDataSet'
    });
    // @ts-ignore
    const countryStatusCache: Record<IsoCode, CountryStatus> = {};
    const statusPalette = {
        notInDataSet: colorScheme.palette.unavailable,
        notSelected: colorScheme.palette.inactive,
        dataUnavailable: colorScheme.palette.unavailable
    };

    const mapWidth = width - 2 * margin;
    const mapHeight = height - 2 * margin;

    const cleanD3Elements = () => {
        // Make sure that the only SVG tag inside the root div is the map
        d3.select(`#${rootId}`).selectAll('*').remove();
    };

    // Constructs a unique ID for each country path element in the map to allow selection later
    const countryPathId = (isoCode: IsoCode) => {
        return `${rootId}-country-${isoCode}`.toLowerCase();
    };

    // Returns the actual svg path element by isoCode
    const countryPathElement = (isoCode: IsoCode) => {
        return d3.select(`#${countryPathId(isoCode)}`);
    };

    // Constructs a unique ID for the legend
    const legendId = () => {
        return `${rootId}-legend`.toLowerCase();
    };

    // Returns the actual legend element
    const legendElement = () => {
        return d3.select(`#${legendId()}`);
    };

    function showTooltip(event: MouseEvent, featureProps: WorldMapFeatureProps) {
        // Show tooltip
        setTooltipProps({
            visible: true,
            xPos: event.pageX - 50,
            yPos: event.pageY - 50,
            featureProps: featureProps,
            covidDataItem: selectedCovidData.find(
                ({ geo_location: { iso_code } }) => iso_code === featureProps.adm0_a3
            ),
            countryStatus: countryStatusCache[featureProps.adm0_a3]
        });
    }

    function hideTooltip() {
        setTooltipProps({
            ...tooltipProps,
            visible: false
        });
    }

    const { gen: colorGen } = bivariateColorGenerator(colorScheme, bivariateData);

    function determineCountryStatus(featureProps: WorldMapFeatureProps): CountryStatus {
        // The country is not supported by the data set
        if (supportedCountry(featureProps) === undefined) {
            return 'notInDataSet';
        }
        const countrySelection = selectedCountry(featureProps);
        // The country is supported, but not selected
        if (countrySelection === undefined) {
            return 'notSelected';
        }
        // The country is supported, selected & has data for this time range
        if (meansByIsoCode[countrySelection.iso_code] !== undefined) {
            return 'selected';
        }
        // The country is supported, but has no data for this time range
        return 'dataUnavailable';
    }

    function featureFillDefault(featureProps: WorldMapFeatureProps) {
        const status =
            countryStatusCache[featureProps.adm0_a3] || determineCountryStatus(featureProps);
        if (countryStatusCache[featureProps.adm0_a3] === undefined) {
            countryStatusCache[featureProps.adm0_a3] = status;
        }
        return status === 'selected'
            ? colorGen(meansByIsoCode[featureProps.adm0_a3])
            : statusPalette[status];
    }

    function handleFeatureClick(event: MouseEvent, featureProps: WorldMapFeatureProps) {
        onClick(featureProps);
        showTooltip(event, featureProps);
    }

    function handleMouseMove(event: MouseEvent, featureProps: WorldMapFeatureProps) {
        showTooltip(event, featureProps);
    }

    function handleFeatureMouseover(event: MouseEvent, featureProps: WorldMapFeatureProps) {
        // Set fill
        countryPathElement(featureProps.adm0_a3)
            .transition()
            .style('fill', colorScheme.palette.hovered);
        showTooltip(event, featureProps);
    }

    function handleFeatureMouseout(event: MouseEvent, featureProps: WorldMapFeatureProps) {
        // Reset fill
        countryPathElement(featureProps.adm0_a3)
            .transition()
            .style('fill', featureFillDefault(featureProps));
        hideTooltip();
    }

    useEffect(() => {
        // Create the SVG element of the map
        const svg = d3
            .select(`#${rootId}`)
            .append('svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

        // Legend grid
        const n = 3;
        const grid = d3.cross(d3.range(n), d3.range(n));

        // Grid tile sizes
        const tileSize = 0.04 * width;
        const tileWidths = d3.range(n).map((_) => tileSize);
        const tileHeights = d3.range(n).map((_) => tileSize);

        // get the total height of the grid to be used to calculate the y coordinates
        const totalH = tileHeights.reduce((a, b) => a + b, 0);

        // utility function to get the tile dimensions
        function dim(i: number, j: number): [w: number, h: number] {
            return [tileWidths[i], tileHeights[j]];
        }

        // utility function to get the tile coordinates
        function coord(i: number, j: number): [x: number, y: number] {
            // sum of the preceeding tiles' widths
            const x = tileWidths.slice(0, i).reduce((acc, currW) => acc + currW, 0);
            // totalH - sum of the preceeding tiles' heights + the current tile's height
            // (0, 0) is the top left corner of the grid
            const y = totalH - tileHeights.slice(0, j + 1).reduce((acc, currH) => acc + currH, 0);
            return [x, y];
        }

        svg.append('g')
            .attr('id', legendId())
            .selectAll('rect')
            .data(grid)
            .enter()
            .append('rect')
            .attr('fill', ([i, j]) => colorScheme.palette.scale[j * n + i])
            .attr('width', ([i, j]) => dim(i, j)[0])
            .attr('height', ([i, j]) => dim(i, j)[1])
            .attr('x', ([i, j]) => coord(i, j)[0])
            .attr('y', ([i, j]) => coord(i, j)[1])
            .attr('coord', ([i, j]) => `[${i};${j}]`)
            .attr('transform', `translate(${tileSize / 2}, ${mapHeight - totalH - tileSize / 2})`);

        const arrowMarkerId = `${rootId}-legend-arrow-marker`;

        svg.append('defs')
            .append('marker')
            .attr('id', arrowMarkerId)
            .attr('orient', 'auto')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', '0')
            .attr('refY', '0')
            .attr('markerWidth', '6')
            .attr('markerHeight', '6')
            .attr('xoverflow', 'visible')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', colorScheme.palette.stroke);

        // Element dimensions
        const legendArrowShift = 0.025 * tileSize;
        const legendArrowExtraLength = 0.25 * tileSize;
        const legendSquareSize = 3 * tileSize;

        // Horizontal line
        legendElement()
            .append('line')
            .attr('x1', tileSize / 2 - legendArrowShift)
            .attr('y1', mapHeight - tileSize / 2 + legendArrowShift)
            .attr('x2', tileSize / 2 + legendSquareSize + legendArrowExtraLength)
            .attr('y2', mapHeight - totalH - tileSize / 2 + legendSquareSize + legendArrowShift)
            .attr('stroke', colorScheme.palette.stroke)
            .attr('stroke-width', 1.5)
            .attr('marker-end', `url(#${arrowMarkerId})`);
        // Horizontal axis label
        legendElement()
            .append('text')
            .attr('x', 2 * tileSize)
            .attr('y', mapHeight)
            .attr('text-anchor', 'middle')
            .attr('font-size', width >= 600 ? '0.8em' : '0.5em')
            .attr('fill', colorScheme.palette.stroke)
            .text('Positive Rate');

        // Vertical line
        legendElement()
            .append('line')
            .attr('x1', tileSize / 2 - legendArrowShift)
            .attr('y1', mapHeight - tileSize / 2 + legendArrowShift)
            .attr('x2', tileSize / 2 - legendArrowShift)
            .attr('y2', mapHeight - totalH - tileSize / 2 - legendArrowExtraLength)
            .attr('stroke', colorScheme.palette.stroke)
            .attr('stroke-width', 1.5)
            .attr('marker-end', `url(#${arrowMarkerId})`);
        // Vertical axis label
        legendElement()
            .append('text')
            .attr('x', -mapHeight + 2 * tileSize)
            .attr('y', legendArrowExtraLength)
            .attr('text-anchor', 'middle')
            .attr('font-size', width >= 600 ? '0.8em' : '0.5em')
            .attr('fill', colorScheme.palette.stroke)
            .attr('transform', 'rotate(-90)')
            .text('Vaccination Rate');

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
            .attr('class', 'hover:cursor-pointer')
            .on('click', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                handleFeatureClick(event, featureProps);
            })
            .on('mouseover', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                handleFeatureMouseover(event, featureProps);
            })
            .on('mousemove', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                handleMouseMove(event, featureProps);
            })
            .on('mouseout', (event, d) => {
                const featureProps = d.properties as WorldMapFeatureProps;
                handleFeatureMouseout(event, featureProps);
            });

        // Cleanup after unmount
        return cleanD3Elements;
    }, [width, height, selectedCovidData, geoData]);

    return (
        <>
            <div
                id={rootId}
                style={{ backgroundColor: colorScheme.palette.background }}
                className="rounded-b-lg"
            />
            <ChoroplethMapTooltip {...tooltipProps} />
        </>
    );
}

type ChoroplethMapTooltipProps = {
    visible: boolean;
    xPos: number;
    yPos: number;
    featureProps: WorldMapFeatureProps;
    countryStatus: CountryStatus;
    covidDataItem?: CovidDataItem;
};

function ChoroplethMapTooltip({
    visible,
    xPos,
    yPos,
    featureProps,
    countryStatus,
    covidDataItem
}: ChoroplethMapTooltipProps) {
    return (
        <div
            style={{ left: xPos, top: yPos, display: visible ? 'block' : 'none' }}
            className="p-2 absolute rounded-md text-white text-xs bg-blue-500"
        >
            {covidDataItem && (
                <p>
                    --- {covidDataItem.geo_location.location}: {countryStatus} ---
                </p>
            )}
            {!covidDataItem && <p>{featureProps.continent}</p>}
        </div>
    );
}

export default ChoroplethMap;
