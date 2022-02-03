import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem, InfectionIndicator, RiskFactor } from '@models/covid-data-item';
import { IsoCode } from '@models/geo-location';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { useEffect, useMemo } from 'react';
import { useFetchedCovidData } from '@contexts/fetched-covid-data/FetchedCovidDataContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { infectionIndicatorData, riskFactorData } from '@data/indicator-data';

type HeatMapProps = {
    width: number;
    height: number;
};

function pearsonCorrelation(x: number[], y: number[]) {
    const n = x.length;
    const sumX = d3.sum(x);
    const sumY = d3.sum(y);
    const sumX2 = d3.sum(x.map((x) => x * x));
    const sumY2 = d3.sum(y.map((y) => y * y));
    const sumXY = d3.sum(x.map((x, i) => x * y[i]));
    const denom = Math.sqrt((sumX2 - (sumX * sumX) / n) * (sumY2 - (sumY * sumY) / n));
    if (denom === 0) {
        return 0;
    }
    return (sumXY - (sumX * sumY) / n) / denom;
}

function getAggregatedData(covidData: CovidDataItem[]) {
    const dataByIsoCode = groupBy<CovidDataItem, IsoCode>(
        covidData,
        ({ geo_location: { iso_code } }) => iso_code
    );
    const riskFactors = Object.keys(riskFactorData) as RiskFactor[];
    const riskFactorValuesPerCountry = riskFactors.reduce((acc, curr) => {
        const valuesPerCountry = Object.values(dataByIsoCode)
            .map((list) =>
                list.find(
                    (item) => (item as any)[curr] !== undefined && (item as any)[curr] !== null
                )
            )
            .filter((item) => item !== undefined)
            .map((item) => (item as any)[curr] as number);
        return {
            ...acc,
            [curr]: valuesPerCountry
        };
    }, {} as Record<RiskFactor, number[]>);

    const infectionIndicators = Object.keys(infectionIndicatorData) as InfectionIndicator[];
    const infectionIndicatorsPerCountry = infectionIndicators.reduce((acc, curr) => {
        const valuesPerCountry = Object.values(dataByIsoCode)
            .map((list) =>
                list.find(
                    (item) => (item as any)[curr] !== undefined && (item as any)[curr] !== null
                )
            )
            .filter((item) => item !== undefined)
            .map((item) => (item as any)[curr] as number);
        return {
            ...acc,
            [curr]: valuesPerCountry
        };
    }, {} as Record<InfectionIndicator, number[]>);
    // Return correlation matrix
    return Object.keys(riskFactorValuesPerCountry).reduce((outerAcc, outerCurr) => {
        const riskFactorValues = riskFactorValuesPerCountry[outerCurr as RiskFactor];
        const row = Object.keys(infectionIndicatorsPerCountry).reduce((innerAcc, innerCurr) => {
            const indicatorValues = infectionIndicatorsPerCountry[innerCurr as InfectionIndicator];
            const R = pearsonCorrelation(riskFactorValues, indicatorValues);
            return [
                ...innerAcc,
                {
                    x: outerCurr as RiskFactor,
                    y: innerCurr as InfectionIndicator,
                    correlation: Number.isNaN(R) ? 0 : R
                }
            ];
        }, [] as HeatMapDataPoint[]);
        return [...outerAcc, ...row];
    }, [] as HeatMapDataPoint[]);
}

function HeatMap({ width, height }: HeatMapProps) {
    const {
        state: { colorScheme }
    } = useUserConfig();
    const {
        state: { covidDataItems }
    } = useFetchedCovidData();

    const heatMapData = useMemo(() => getAggregatedData(covidDataItems), [covidDataItems]);
    console.log(heatMapData);

    return (
        <HeatMapFragment
            width={width}
            height={height}
            colorScheme={colorScheme}
            heatMapData={heatMapData}
        />
    );
}

type HeatMapDataPoint = { x: RiskFactor; y: InfectionIndicator; correlation: number };

type HeatMapFragmentProps = {
    width: number;
    height: number;
    colorScheme: ColorScheme;
    heatMapData: HeatMapDataPoint[];
    rootId?: string;
    margin?: number;
};

function HeatMapFragment({
    width,
    height,
    colorScheme,
    heatMapData,
    rootId = 'heatmap',
    margin = 20
}: HeatMapFragmentProps) {
    const plotWidth = width - margin * 6;
    const plotHeight = height - margin * 2;

    const rootElement = () => d3.select(`#${rootId}`);
    const plotGroupId = `${rootId}-plot-group`;
    const cleanD3Elements = () => {
        // Make sure that the only SVG tag inside the root div is the map
        rootElement().selectAll('*').remove();
    };
    const xAxisGroupId = `${rootId}-x-axis-group`;
    const xAxisGroupElement = () => rootElement().select(`#${xAxisGroupId}`);
    const yAxisGroupId = `${rootId}-y-axis-group`;
    const yAxisGroupElement = () => rootElement().select(`#${yAxisGroupId}`);
    const heatRectId = (heatMapDataPoint: HeatMapDataPoint) =>
        `${rootId}-heat-rect-${heatMapDataPoint.x}-${heatMapDataPoint.y}`;
    const heatRectElement = (heatMapDataPoint: HeatMapDataPoint) =>
        d3.select(`#${heatRectId(heatMapDataPoint)}`);

    const xLabels = heatMapData.map((d) => d.x);
    const yLabels = heatMapData.map((d) => d.y);

    useEffect(() => {
        if (plotWidth < 0 || plotHeight < 0) return;

        // Create the SVG element of the map
        const svg = d3
            .select(`#${rootId}`)
            .append('svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .append('g')
            .attr('id', plotGroupId)
            .attr('transform', `translate(${4 * margin}, ${margin})`);

        const transX = 0.3 * plotWidth;

        const xScale = d3.scaleBand().domain(xLabels).range([0, plotHeight]).padding(0.01);
        svg.append('g')
            .attr('id', xAxisGroupId)
            .attr('transform', `translate(${transX}, ${plotHeight - 50})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end')
            .style('font-size', '0.95em')
            .attr('fill', colorScheme.palette.stroke);
        // Hide the actual axis
        xAxisGroupElement().select('.domain').attr('stroke', colorScheme.palette.background);
        xAxisGroupElement().selectAll('line').attr('stroke', colorScheme.palette.background);

        const yScale = d3
            .scaleBand()
            .domain(yLabels)
            .range([plotHeight - 50, 0])
            .padding(0.01);
        svg.append('g')
            .attr('id', yAxisGroupId)
            .attr('transform', `translate(${transX}, 0)`)
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end')
            .style('font-size', '0.95em')
            .attr('fill', colorScheme.palette.stroke);
        // Hide the actual axis
        yAxisGroupElement().select('.domain').attr('stroke', colorScheme.palette.background);
        yAxisGroupElement().selectAll('line').attr('stroke', colorScheme.palette.background);

        const colorScale = d3
            .scaleLinear()
            .domain([-1, 0, 1])
            // @ts-ignore
            .range([
                colorScheme.palette.scale[0],
                colorScheme.palette.scale[5],
                colorScheme.palette.scale[8]
            ]);

        svg.selectAll('heat-rect')
            .data(heatMapData)
            .enter()
            .append('rect')
            .attr('id', (d) => heatRectId(d))
            // @ts-ignore
            .attr('x', (d) => transX + xScale(d.x))
            // @ts-ignore
            .attr('y', (d) => yScale(d.y))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', (d) => colorScale(d.correlation))
            .attr('rx', 2)
            .attr('ry', 2);

        return cleanD3Elements;
    }, [plotWidth, plotHeight, heatMapData, colorScheme]);

    return (
        <>
            <div
                id={rootId}
                style={{ backgroundColor: colorScheme.palette.background }}
                className="rounded-b-lg"
            />
        </>
    );
}

export default HeatMap;
