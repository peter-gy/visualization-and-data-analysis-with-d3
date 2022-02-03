import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem, RiskFactor } from '@models/covid-data-item';
import { GeoLocation, IsoCode } from '@models/geo-location';
import { univariateColorGenerator } from '@services/color-gen-service';
import { groupBy } from '@utils/collection-utils';
import { snakeCaseToCapitalCase } from '@utils/string-utils';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { CountryFlagIso3 } from '@components/utils/CountryFlag';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';

type LollipopDataPoint = { country: GeoLocation; positive_rate: number; risk_factor_value: number };

function getAggregatedData(
    covidData: CovidDataItem[],
    riskFactor: RiskFactor
): { isoCode: IsoCode; positive_rate: number; risk_factor_value: number }[] {
    const dataByIsoCode = groupBy<CovidDataItem, IsoCode>(
        covidData,
        ({ geo_location: { iso_code } }) => iso_code
    );
    return Object.keys(dataByIsoCode).reduce((acc, curr) => {
        const isoCode = curr as IsoCode;
        const cleanItems = dataByIsoCode[isoCode].filter((d) => {
            const riskFactorValue = (d as any)[riskFactor] as number | undefined;
            return riskFactorValue !== undefined && d.positive_rate !== null;
        });
        // No clean data found for the country
        if (cleanItems.length === 0) {
            return acc;
        }
        const positive_rate = d3.mean(cleanItems, ({ positive_rate }) => positive_rate) as number;
        return [
            ...acc,
            { isoCode, positive_rate, risk_factor_value: (cleanItems[0] as any)[riskFactor] }
        ];
    }, [] as { isoCode: IsoCode; positive_rate: number; risk_factor_value: number }[]);
}

type LollipopChartProps = {
    width: number;
    height: number;
    selectedCovidData: CovidDataItem[];
};

function LollipopChart({ width, height, selectedCovidData }: LollipopChartProps) {
    const {
        state: { countriesByIsoCode }
    } = useOCDQueryConfig();
    const {
        state: { colorScheme, selectedRiskFactor }
    } = useUserConfig();

    const lollipopData = useMemo(
        () =>
            getAggregatedData(selectedCovidData, selectedRiskFactor).map((d) => {
                // exclude isoCode and replace it with country (GeoLocation)
                const { isoCode, ...rest } = d;
                return {
                    ...rest,
                    country: countriesByIsoCode[isoCode]
                };
            }),
        [selectedCovidData, selectedRiskFactor]
    );

    return (
        <LollipopChartFragment
            width={width}
            height={height}
            // flatten palette
            colorScheme={{
                ...colorScheme,
                palette: {
                    ...colorScheme.palette,
                    scale: [0, 3, 6, 7, 4, 1, 2, 5, 8].map((i) => colorScheme.palette.scale[i])
                }
            }}
            lollipopData={lollipopData}
            selectedRiskFactor={selectedRiskFactor}
        />
    );
}

type LollipopChartFragmentProps = {
    width: number;
    height: number;
    colorScheme: ColorScheme;
    lollipopData: LollipopDataPoint[];
    selectedRiskFactor: RiskFactor;
    rootId?: string;
    margin?: number;
};

function LollipopChartFragment({
    width,
    height,
    colorScheme,
    lollipopData,
    selectedRiskFactor,
    rootId = 'lollipop-chart',
    margin = 15
}: LollipopChartFragmentProps) {
    const [tooltipProps, setTooltipProps] = useState<LollipopChartTooltipProps>({
        visible: false,
        xPos: 0,
        yPos: 0,
        riskFactor: selectedRiskFactor,
        lollipopDataPoint: undefined
    });

    const chartWidth = width - 6 * margin;
    const chartHeight = height - 3 * margin;

    const rootElement = () => d3.select(`#${rootId}`);
    const xAxisGroupId = `${rootId}-x-axis-group`;
    const yAxisGroupId = `${rootId}-y-axis-group`;
    const lollipopGroupId = `${rootId}-lollipop-group`;
    const gXElement = () => rootElement().select(`#${xAxisGroupId}`);
    const gYElement = () => rootElement().select(`#${yAxisGroupId}`);
    const lollipopLineId = (isoCode: IsoCode) => `${lollipopGroupId}-line-${isoCode}`.toLowerCase();
    const lollipopCircleId = (isoCode: IsoCode) =>
        `${lollipopGroupId}-circle-${isoCode}`.toLowerCase();
    const lollipopCircleElement = (isoCode: IsoCode) =>
        rootElement().select(`#${lollipopCircleId(isoCode)}`);

    // Rates for the univariate color generator & scales
    const positiveRateValues = lollipopData.map(({ positive_rate }) => positive_rate);
    const riskFactorValues = lollipopData.map(({ risk_factor_value }) => risk_factor_value);

    const cleanD3Elements = () => {
        // Make sure that the only SVG tag inside the root div is the map
        d3.select(`#${rootId}`).selectAll('*').remove();
    };

    const { gen: circleColorGen } = univariateColorGenerator(colorScheme, positiveRateValues);

    function getLollipopCircleFill(lollipopDataPoint: LollipopDataPoint) {
        return circleColorGen(lollipopDataPoint.positive_rate);
    }

    function showTooltip(event: MouseEvent, lollipopDataPoint: LollipopDataPoint) {
        // Show tooltip
        setTooltipProps({
            ...tooltipProps,
            visible: true,
            xPos: event.pageX - 90,
            yPos: event.pageY - 90,
            lollipopDataPoint: lollipopDataPoint
        });
    }

    function hideTooltip() {
        setTooltipProps({
            ...tooltipProps,
            visible: false
        });
    }

    function focusLegend(lollipopDataPoint: LollipopDataPoint) {
        const color = circleColorGen(lollipopDataPoint.positive_rate);
        const idx = colorScheme.palette.scale.indexOf(color);
        rootElement()
            .selectAll('rect')
            .filter((d) => d === idx)
            .attr('stroke', colorScheme.palette.hovered)
            .attr('stroke-width', 2);
    }

    function unfocusLegend() {
        rootElement()
            .selectAll('rect')
            .attr('stroke', colorScheme.palette.stroke)
            .attr('stroke-width', 0.1);
    }

    function handleMouseOver(event: MouseEvent, lollipopDataPoint: LollipopDataPoint) {
        lollipopCircleElement(lollipopDataPoint.country.iso_code)
            .transition()
            .attr('fill', colorScheme.palette.hovered);
        showTooltip(event, lollipopDataPoint);
        focusLegend(lollipopDataPoint);
    }

    function handleMouseMove(event: MouseEvent, lollipopDataPoint: LollipopDataPoint) {
        showTooltip(event, lollipopDataPoint);
    }

    function handleMouseOut(event: MouseEvent, lollipopDataPoint: LollipopDataPoint) {
        lollipopCircleElement(lollipopDataPoint.country.iso_code)
            .transition()
            .attr('fill', getLollipopCircleFill(lollipopDataPoint));
        hideTooltip();
        unfocusLegend();
    }

    useEffect(() => {
        if (chartWidth < 0 || chartHeight < 0) return;
        // Create the base SVG
        const svg = d3
            .select(`#${rootId}`)
            .append('svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .append('g')
            .attr('transform', `translate(${3.5 * margin}, ${2 * margin})`);

        // x-axis
        const xScale = d3
            .scaleBand()
            .range([0, chartWidth])
            .domain(
                lollipopData
                    .map(({ country: { location } }) => location)
                    .sort((a, b) => a.localeCompare(b))
            )
            .padding(1);
        svg.append('g')
            .attr('id', xAxisGroupId)
            .attr('transform', `translate(0, ${chartHeight - 55})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'translate(-10,0)rotate(-35)')
            .style('text-anchor', 'end');
        gXElement().select('.domain').attr('stroke', colorScheme.palette.stroke);
        gXElement().selectAll('line').attr('stroke', colorScheme.palette.stroke);
        gXElement().selectAll('text').attr('fill', colorScheme.palette.stroke);

        // y-axis
        const yScale = d3
            .scaleLinear()
            .domain([0, 1.1 * (d3.max(riskFactorValues) as number)])
            .range([chartHeight - 55, 0]);
        svg.append('g').attr('id', yAxisGroupId).call(d3.axisLeft(yScale).ticks(8));
        gYElement().select('.domain').attr('stroke', colorScheme.palette.stroke);
        gYElement().selectAll('line').attr('stroke', colorScheme.palette.stroke);
        gYElement().selectAll('text').attr('fill', colorScheme.palette.stroke);
        // y-axis label
        gYElement()
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', 0)
            .attr('y', -35)
            .style('text-anchor', 'end')
            .style('fill', colorScheme.palette.stroke)
            .style('font-weight', 'bold')
            .text(snakeCaseToCapitalCase(selectedRiskFactor));

        // Lines
        svg.selectAll('lollipop-line')
            .data(lollipopData)
            .enter()
            .append('line')
            .attr('id', (d) => lollipopLineId(d.country.iso_code))
            // @ts-ignore
            .attr('x1', (d) => xScale(d.country.location))
            // @ts-ignore
            .attr('x2', (d) => xScale(d.country.location))
            .attr('y1', (d) => yScale(d.risk_factor_value))
            .attr('y2', yScale(0))
            .attr('stroke', colorScheme.palette.stroke);

        // Circles
        svg.selectAll('lollipop-circles')
            .data(lollipopData)
            .join('circle')
            .attr('id', (d) => lollipopCircleId(d.country.iso_code))
            // @ts-ignore
            .attr('cx', (d) => xScale(d.country.location))
            .attr('cy', (d) => yScale(d.risk_factor_value))
            .attr('r', 10)
            .attr('fill', getLollipopCircleFill)
            .attr('stroke', colorScheme.palette.stroke)
            .on('mouseover', (e, d) => handleMouseOver(e, d))
            .on('mousemove', (e, d) => handleMouseMove(e, d))
            .on('mouseout', (e, d) => handleMouseOut(e, d));

        // Legend
        const tileSize = 0.035 * chartWidth;

        // Arrow
        const arrowMarkerId = `${rootId}-legend-arrow-marker`;
        svg.append('defs')
            .append('marker')
            .attr('id', arrowMarkerId)
            .attr('orient', 'auto')
            .attr('viewBox', '-10 -5 10 10')
            .attr('refX', '0')
            .attr('refY', '0')
            .attr('markerWidth', '6')
            .attr('markerHeight', '6')
            .attr('xoverflow', 'visible')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', colorScheme.palette.stroke)
            .attr('transform', 'rotate(180)');

        svg.append('line')
            .attr('x1', chartWidth)
            .attr('y1', -tileSize / 3)
            .attr('x2', chartWidth)
            .attr('y2', colorScheme.palette.scale.length * tileSize)
            .attr('stroke', colorScheme.palette.stroke)
            .attr('stroke-width', 1.5)
            .attr('marker-start', `url(#${arrowMarkerId})`);

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -0.25 * tileSize)
            .attr('y', chartWidth - 0.25 * tileSize)
            .style('text-anchor', 'end')
            .style('fill', colorScheme.palette.stroke)
            .style('font-weight', 'bold')
            .attr('font-size', width >= 600 ? '1.2em' : '0.75em')
            .text('Infection Rate');

        svg.selectAll('legend-tile')
            .data([...colorScheme.palette.scale.keys()])
            .join('rect')
            .attr('x', (d) => chartWidth)
            .attr('y', (d) => d * tileSize)
            .attr('width', tileSize)
            .attr('height', tileSize)
            .attr(
                'fill',
                (d) => colorScheme.palette.scale[colorScheme.palette.scale.length - 1 - d]
            )
            .attr('stroke-width', 0.1)
            .attr('stroke', colorScheme.palette.stroke);

        return cleanD3Elements;
    }, [width, height, lollipopData, selectedRiskFactor, colorScheme]);

    return (
        <>
            <div
                id={rootId}
                style={{ backgroundColor: colorScheme.palette.background }}
                className="rounded-b-lg"
            />
            <LollipopChartTooltip {...tooltipProps} />
        </>
    );
}

type LollipopChartTooltipProps = {
    visible: boolean;
    xPos: number;
    yPos: number;
    riskFactor: RiskFactor;
    lollipopDataPoint?: LollipopDataPoint;
};

function LollipopChartTooltip({
    visible,
    xPos,
    yPos,
    riskFactor,
    lollipopDataPoint
}: LollipopChartTooltipProps) {
    if (lollipopDataPoint === undefined) return <span />;
    return (
        <div
            style={{ left: xPos, top: yPos, display: visible ? 'block' : 'none' }}
            className="p-2 absolute rounded-md text-white text-xs bg-primary z-[100000] border-[0.5px]"
        >
            <div className="flex justify-between p-1 items-center">
                <p className="font-bold">{lollipopDataPoint.country.location}</p>
                <CountryFlagIso3 iso31661={lollipopDataPoint.country.iso_code} />
            </div>
            <p>
                {snakeCaseToCapitalCase(riskFactor)}:{' '}
                {d3.format('.2')(lollipopDataPoint.risk_factor_value)}
            </p>
            <p>Infection Rate: {d3.format('.2')(lollipopDataPoint.positive_rate)}</p>
        </div>
    );
}

export default LollipopChart;
