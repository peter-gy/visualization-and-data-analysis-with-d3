import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem, InfectionIndicator, RiskFactor } from '@models/covid-data-item';
import { IsoCode } from '@models/geo-location';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { useFetchedCovidData } from '@contexts/fetched-covid-data/FetchedCovidDataContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { infectionIndicatorData, riskFactorData } from '@data/indicator-data';
import { snakeCaseToCapitalCase } from '@utils/string-utils';

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
    const [tooltipProps, setTooltipProps] = useState<HeatMapTooltipProps>({
        visible: false,
        xPos: 0,
        yPos: 0,
        mode: 'rect'
    });
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
    const focusLineId = `${rootId}-focus-line`;
    const focusLineElement = () => rootElement().select(`#${focusLineId}`);

    const xLabels = heatMapData.map((d) => (d.x));
    const yLabels = heatMapData.map((d) => (d.y));
    const legendScale = d3
        .scaleLinear()
        .domain([-1, 1])
        .range([0, 0.85 * plotHeight]);

    function showFocusLine(correlation: number) {
        const yPos = 0.85 * plotHeight - legendScale(correlation);
        focusLineElement()
            .style('display', 'block')
            .transition()
            .duration(250)
            .attr('y1', yPos)
            .attr('y2', yPos);
    }

    function hideFocusLine() {
        focusLineElement().style('display', 'none');
    }

    function showTooltipRect(event: MouseEvent, heatMapDataPoint: HeatMapDataPoint) {
        setTooltipProps({
            visible: true,
            mode: 'rect',
            xPos: event.clientX - 50,
            yPos: event.clientY - 50,
            dataPoint: heatMapDataPoint
        });
    }

    function handleRectMouseOver(event: MouseEvent, heatMapDataPoint: HeatMapDataPoint) {
        const { x, y, correlation } = heatMapDataPoint;
        heatRectElement(heatMapDataPoint).attr('stroke', colorScheme.palette.hovered);
        showFocusLine(correlation);
        showTooltipRect(event, heatMapDataPoint);

        // Label coloring
        xAxisGroupElement()
            .selectAll('text')
            .attr('fill', (d) =>
                d === (x) ? colorScheme.palette.hovered : colorScheme.palette.stroke
            );
        yAxisGroupElement()
            .selectAll('text')
            .attr('fill', (d) =>
                d === (y) ? colorScheme.palette.hovered : colorScheme.palette.stroke
            );
    }

    function handleRectMouseMove(event: MouseEvent, heatMapDataPoint: HeatMapDataPoint) {
        showTooltipRect(event, heatMapDataPoint);
    }

    function handleRectMouseOut(event: MouseEvent, heatMapDataPoint: HeatMapDataPoint) {
        heatRectElement(heatMapDataPoint).attr('stroke', 'none');
        hideFocusLine();
        hideTooltip();
        xAxisGroupElement().selectAll('text').attr('fill', colorScheme.palette.stroke);
        yAxisGroupElement().selectAll('text').attr('fill', colorScheme.palette.stroke);
    }

    function showTooltipRisk(event: MouseEvent, riskFactor: RiskFactor) {
        setTooltipProps({
            visible: true,
            mode: 'risk',
            xPos: event.clientX - 50,
            yPos: event.clientY - 50,
            labelToExplain: riskFactor
        });
    }

    function showTooltipDevelopment(event: MouseEvent, infectionIndicator: InfectionIndicator) {
        setTooltipProps({
            visible: true,
            mode: 'development',
            xPos: event.clientX - 50,
            yPos: event.clientY - 50,
            labelToExplain: infectionIndicator
        });
    }

    function hideTooltip() {
        setTooltipProps({ ...tooltipProps, visible: false });
    }

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
            .call(d3.axisBottom(xScale).tickFormat(snakeCaseToCapitalCase))
            .selectAll('text')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end')
            .style('font-size', '0.95em')
            .attr('fill', colorScheme.palette.stroke)
            .on('mouseover', (e, d) => showTooltipRisk(e, d as RiskFactor))
            .on('mousemove', (e, d) => showTooltipRisk(e, d as RiskFactor))
            .on('mouseout', (_) => hideTooltip());
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
            .call(d3.axisLeft(yScale).tickFormat(snakeCaseToCapitalCase))
            .selectAll('text')
            .attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end')
            .style('font-size', '0.95em')
            .attr('fill', colorScheme.palette.stroke)
            .on('mouseover', (e, d) => showTooltipDevelopment(e, d as InfectionIndicator))
            .on('mousemove', (e, d) => showTooltipDevelopment(e, d as InfectionIndicator))
            .on('mouseout', (_) => hideTooltip());
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
            .attr('ry', 2)
            .on('mouseover', handleRectMouseOver)
            .on('mousemove', handleRectMouseMove)
            .on('mouseout', handleRectMouseOut);

        const legendHeight = 0.85 * plotHeight;
        const numStops = 500;
        const intervalLength = (1 - -1) / numStops;
        const sliceWidth = 0.5 * xScale.bandwidth();
        const sliceHeight = legendHeight / numStops;
        svg.selectAll()
            .data(d3.range(numStops))
            .enter()
            .append('rect')
            .attr('x', (d) => 0.9 * plotWidth)
            .attr('y', (d) => legendHeight - sliceHeight * (d + 1))
            .attr('width', sliceWidth)
            .attr('height', sliceHeight)
            .attr('fill', (d) => colorScale(d * intervalLength - 1));

        // Sync line for rect hover
        svg.append('line')
            .attr('id', focusLineId)
            .attr('x1', 0.9 * plotWidth)
            .attr('y1', legendHeight - legendScale(-1))
            .attr('x2', 0.9 * plotWidth + sliceWidth)
            .attr('y2', legendHeight - legendScale(-1))
            .attr('stroke', colorScheme.palette.hovered)
            .attr('stroke-width', 3)
            .style('display', 'none');

        // Labels
        svg.append('text')
            .attr('x', -0.6 * plotHeight)
            .attr('y', 0.9 * plotWidth - 0.5 * sliceWidth)
            .text('Correlation Value')
            .attr('fill', colorScheme.palette.stroke)
            .attr('transform', 'rotate(-90)');
        svg.append('text')
            .attr('x', 0.9 * plotWidth + 1.5 * sliceWidth)
            .attr('y', 1.025 * legendHeight)
            .text('-1')
            .attr('fill', colorScheme.palette.stroke);
        svg.append('text')
            .attr('x', 0.9 * plotWidth + 1.5 * sliceWidth)
            .attr('y', 0.5 * legendHeight)
            .text('0')
            .attr('fill', colorScheme.palette.stroke);
        svg.append('text')
            .attr('x', 0.9 * plotWidth + 1.5 * sliceWidth)
            .attr('y', 0.025 * legendHeight)
            .text('1')
            .attr('fill', colorScheme.palette.stroke);

        return cleanD3Elements;
    }, [plotWidth, plotHeight, heatMapData, colorScheme]);

    return (
        <>
            <div
                id={rootId}
                style={{ backgroundColor: colorScheme.palette.background }}
                className="rounded-b-lg"
            />
            <HeatMapTooltip {...tooltipProps} />
        </>
    );
}

type HeatMapTooltipProps = {
    visible: boolean;
    xPos: number;
    yPos: number;
    mode: 'rect' | 'risk' | 'development';
    dataPoint?: HeatMapDataPoint;
    labelToExplain?: string;
};

function HeatMapTooltip({
    visible,
    xPos,
    yPos,
    mode,
    dataPoint,
    labelToExplain
}: HeatMapTooltipProps) {
    return (
        <div
            style={{ left: xPos, top: yPos, display: visible ? 'block' : 'none' }}
            className="p-2 absolute rounded-md text-white text-xs bg-blue-500"
        >
            <p>{mode}</p>
        </div>
    );
}

export default HeatMap;
