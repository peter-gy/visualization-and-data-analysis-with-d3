import { ColorScheme } from '@models/color-scheme';
import { CountryStatus, CovidDataItem } from '@models/covid-data-item';
import { GeoLocation, IsoCode } from '@models/geo-location';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { CountryFlagIso3 } from '@components/utils/CountryFlag';
import { useFetchedCovidData } from '@contexts/fetched-covid-data/FetchedCovidDataContext';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';

type ScatterPlotProps = {
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
                ({ positive_rate, people_fully_vaccinated_per_hundred }) =>
                    positive_rate !== null && people_fully_vaccinated_per_hundred !== null
            );
            // No clean data found for the country
            if (cleanItems.length === 0) {
                return acc;
            }
            const xMean = d3.mean(cleanItems, ({ positive_rate }) => positive_rate) as number;
            const yMean = d3.mean(
                cleanItems,
                ({ people_fully_vaccinated_per_hundred }) => people_fully_vaccinated_per_hundred
            ) as number;
            return { ...acc, [key]: { x: xMean, y: yMean } };
        }, {} as Record<IsoCode, { x: number; y: number }>);
}

function ScatterPlot({ width, height }: ScatterPlotProps) {
    const {
        state: { countriesByIsoCode }
    } = useOCDQueryConfig();
    const {
        state: { colorScheme, selectedCountriesByIsoCode },
        dispatch: userConfigDispatch
    } = useUserConfig();
    const {
        state: { covidDataItems }
    } = useFetchedCovidData();
    const meansByIsoCode = useMemo(() => getAggregatedData(covidDataItems), [covidDataItems]);

    const scatterData = Object.keys(meansByIsoCode).reduce((acc, isoCode) => {
        const country = countriesByIsoCode[isoCode as IsoCode];
        const { x, y } = meansByIsoCode[isoCode as IsoCode];
        return [...acc, { country, x, y }];
    }, [] as { country: GeoLocation; x: number; y: number }[]);

    const countryIsSelected = (isoCode: IsoCode) =>
        selectedCountriesByIsoCode[isoCode] !== undefined;
    const countryHasData = (isoCode: IsoCode) => meansByIsoCode[isoCode] !== undefined;
    const countryIsInDataSet = (isoCode: IsoCode) => countriesByIsoCode[isoCode] !== undefined;

    function toggleCountrySelection(country: GeoLocation) {
        if (countryIsSelected(country.iso_code)) {
            userConfigDispatch({
                type: 'REMOVE_FROM_SELECTED_COUNTRIES',
                data: country
            });
        } else {
            userConfigDispatch({
                type: 'ADD_TO_SELECTED_COUNTRIES',
                data: country
            });
        }
    }

    return (
        <ScatterPlotFragment
            width={width}
            height={height}
            scatterData={scatterData}
            countryIsSelected={countryIsSelected}
            countryHasData={countryHasData}
            countryIsInDataSet={countryIsInDataSet}
            onCountryClick={toggleCountrySelection}
            colorScheme={colorScheme}
        />
    );
}

type ScatterPoint = { country: GeoLocation; x: number; y: number };

type ScatterPlotFragmentProps = {
    width: number;
    height: number;
    colorScheme: ColorScheme;
    scatterData: ScatterPoint[];
    countryIsSelected: (isoCode: IsoCode) => boolean;
    countryHasData: (isoCode: IsoCode) => boolean;
    countryIsInDataSet: (isoCode: IsoCode) => boolean;
    onCountryClick: (country: GeoLocation) => void;
    rootId?: string;
    margin?: number;
};

function ScatterPlotFragment({
    width,
    height,
    colorScheme,
    scatterData,
    countryIsSelected,
    countryHasData,
    countryIsInDataSet,
    onCountryClick,
    rootId = 'scatter-plot',
    margin = 15
}: ScatterPlotFragmentProps) {
    const [tooltipProps, setTooltipProps] = useState<ScatterPlotTooltipProps>({
        visible: false,
        xPos: 0,
        yPos: 0,
        scatterPoint: undefined,
        countryStatus: 'notInDataSet'
    });

    const plotWidth = width - 6 * margin;
    const plotHeight = height - 2 * margin;

    // @ts-ignore
    const countryStatusCache: Record<IsoCode, CountryStatus> = {};
    const statusPalette = {
        notInDataSet: colorScheme.palette.unavailable,
        selected: colorScheme.palette.clicked,
        notSelected: colorScheme.palette.inactive,
        dataUnavailable: colorScheme.palette.unavailable
    };

    function determineCountryStatus(isoCode: IsoCode): CountryStatus {
        if (!countryIsInDataSet(isoCode)) {
            return 'notInDataSet';
        }
        if (!countryHasData(isoCode)) {
            return 'dataUnavailable';
        }
        if (!countryIsSelected(isoCode)) {
            return 'notSelected';
        }
        return 'selected';
    }

    const rootElement = () => d3.select(`#${rootId}`);
    const plotGroupId = `${rootId}-plot-group`;
    const xAxisGroupId = `${rootId}-x-axis-group`;
    const yAxisGroupId = `${rootId}-y-axis-group`;
    const scatterGroupId = `${rootId}-scatter-group`;
    const scatterCircleId = (country: GeoLocation) => {
        return `${rootId}-scatter-circle-${country.iso_code}`.toLowerCase();
    };
    const scatterCircleElement = (country: GeoLocation) =>
        rootElement().select(`#${scatterCircleId(country)}`);

    // Sorted x and y values for the axes
    const xValues = scatterData.map(({ x }) => x).sort((a, b) => a - b);
    const yValues = scatterData.map(({ y }) => y).sort((a, b) => a - b);

    function getXScale(plotWidth: number, _: number) {
        return d3
            .scaleLinear()
            .domain([xValues[0], xValues[xValues.length - 1]])
            .range([0, plotWidth]);
    }

    function getYScale(plotWidth: number, plotHeight: number) {
        return d3
            .scaleLinear()
            .domain([yValues[0], yValues[yValues.length - 1]])
            .range([plotHeight - 50, 0]);
    }

    const cleanD3Elements = () => {
        // Make sure that the only SVG tag inside the root div is the map
        rootElement().selectAll('*').remove();
    };

    function getCircleFill(scatterPoint: ScatterPoint) {
        const {
            country: { iso_code }
        } = scatterPoint;
        const status = countryStatusCache[iso_code] || determineCountryStatus(iso_code);
        countryStatusCache[iso_code] = status;
        return statusPalette[status];
    }

    function showTooltip(event: MouseEvent, scatterPoint: ScatterPoint) {
        // Show tooltip
        setTooltipProps({
            visible: true,
            xPos: event.pageX - 95,
            yPos: event.pageY - 95,
            scatterPoint: scatterPoint,
            countryStatus: countryStatusCache[scatterPoint.country.iso_code]
        });
    }

    function hideTooltip() {
        setTooltipProps({
            ...tooltipProps,
            visible: false
        });
    }

    function handleCircleClick(event: MouseEvent, scatterPoint: ScatterPoint) {
        onCountryClick(scatterPoint.country);
    }

    function handleCircleMouseOver(event: MouseEvent, scatterPoint: ScatterPoint) {
        scatterCircleElement(scatterPoint.country).attr('fill', colorScheme.palette.hovered);
        showTooltip(event, scatterPoint);
    }

    function handleCircleMouseMove(event: MouseEvent, scatterPoint: ScatterPoint) {
        showTooltip(event, scatterPoint);
    }

    function handleCircleMouseOut(event: MouseEvent, scatterPoint: ScatterPoint) {
        scatterCircleElement(scatterPoint.country).attr('fill', getCircleFill(scatterPoint));
        hideTooltip();
    }

    useEffect(() => {
        if (plotWidth < 0 || plotHeight < 0) return;
        // Create the SVG element of the plot
        const svg = d3
            .select(`#${rootId}`)
            .append('svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .append('g')
            .attr('id', plotGroupId)
            .attr('transform', `translate(${3.5 * margin}, ${margin})`);

        // Create scales
        const xScale = getXScale(plotWidth, plotHeight);
        const yScale = getYScale(plotWidth, plotHeight);

        // x-axis
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('.0%')).ticks(8);
        const gX = svg
            .append('g')
            .attr('id', xAxisGroupId)
            .attr('transform', `translate(0, ${plotHeight - 50})`)
            .call(xAxis);
        gX.select('.domain').attr('stroke', colorScheme.palette.stroke);
        gX.selectAll('line').attr('stroke', colorScheme.palette.stroke);
        gX.selectAll('text').attr('fill', colorScheme.palette.stroke);
        // x-axis label
        gX.append('text')
            .attr('x', plotWidth)
            .attr('y', 40)
            .style('text-anchor', 'end')
            .style('fill', colorScheme.palette.stroke)
            .attr('font-size', width >= 600 ? '1.2em' : '0.9em')
            .style('font-weight', 'bold')
            .text('Infection Rate');

        // y-axis
        const yAxis = d3.axisLeft(yScale).ticks(8);
        const gY = svg.append('g').attr('id', yAxisGroupId).call(yAxis);
        gY.select('.domain').attr('stroke', colorScheme.palette.stroke);
        gY.selectAll('line').attr('stroke', colorScheme.palette.stroke);
        gY.selectAll('text').attr('fill', colorScheme.palette.stroke);
        // y-axis label
        gY.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', 0)
            .attr('y', -30)
            .style('text-anchor', 'end')
            .style('fill', colorScheme.palette.stroke)
            .attr('font-size', width >= 600 ? '1.2em' : '0.9em')
            .style('font-weight', 'bold')
            .text('People Fully Vaccinated / 100');

        svg.append('g')
            .attr('id', scatterGroupId)
            .selectAll('circle')
            .data(scatterData)
            .enter()
            .append('circle')
            .attr('id', ({ country }) => scatterCircleId(country))
            .attr('class', 'hover:cursor-pointer')
            .attr('cx', ({ x }) => xScale(x))
            .attr('cy', ({ y }) => yScale(y))
            .attr('r', 5)
            .attr('fill', (d) => getCircleFill(d))
            .attr('stroke', colorScheme.palette.stroke)
            .attr('stroke-width', 1)
            .on('click', (event, d) => handleCircleClick(event, d))
            .on('mouseover', (event, d) => handleCircleMouseOver(event, d))
            .on('mousemove', (event, d) => handleCircleMouseMove(event, d))
            .on('mouseout', (event, d) => handleCircleMouseOut(event, d));

        return cleanD3Elements;
    }, [width, height, scatterData, colorScheme]);

    return (
        <>
            <div
                id={rootId}
                style={{ backgroundColor: colorScheme.palette.background }}
                className="rounded-b-lg"
            />
            <ScatterPlotTooltip {...tooltipProps} />
        </>
    );
}

type ScatterPlotTooltipProps = {
    visible: boolean;
    xPos: number;
    yPos: number;
    scatterPoint?: ScatterPoint;
    countryStatus: CountryStatus;
};

function ScatterPlotTooltip({
    visible,
    xPos,
    yPos,
    scatterPoint,
    countryStatus
}: ScatterPlotTooltipProps) {
    if (scatterPoint === undefined) return <span />;
    return (
        <div
            style={{ left: xPos, top: yPos, display: visible ? 'block' : 'none' }}
            className="p-2 absolute rounded-md text-white text-xs bg-primary z-[100000] border-[0.5px]"
        >
            <div className="flex justify-between p-1 items-center">
                <p className="font-bold">{scatterPoint.country.location}</p>
                <CountryFlagIso3 iso31661={scatterPoint.country.iso_code} />
            </div>
            <>
                <p>Infection rate: {d3.format('.2')(scatterPoint.x)}</p>
                <p>Full Vaccination rate: {d3.format('.2')(scatterPoint.y)}</p>
            </>
            {countryStatus === 'notSelected' && <p className="italic">(Not Selected)</p>}
            {countryStatus === 'notInDataSet' && (
                <p>{scatterPoint.country.location} is not supported by the data set.</p>
            )}
            {countryStatus === 'dataUnavailable' && (
                <p>
                    Data is unavailable for {scatterPoint.country.location} in the selected time
                    range.
                </p>
            )}
        </div>
    );
}

export default ScatterPlot;
