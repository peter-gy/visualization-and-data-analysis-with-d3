import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem, RiskFactor } from '@models/covid-data-item';
import { GeoLocation, IsoCode } from '@models/geo-location';
import { univariateColorGenerator } from '@services/color-gen-service';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';
import { useFetchedCovidData } from '@contexts/fetched-covid-data/FetchedCovidDataContext';
import { useOCDQueryConfig } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';

// max number of lollipops
const maxCountryCount = 12;

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
            colorScheme={colorScheme}
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
        lollipopDataPoint: lollipopData[0]
    });

    const chartWidth = width - 6 * margin;
    const chartHeight = height - 3 * margin;

    const rootElement = () => d3.select(`#${rootId}`);
    const plotGroupId = `${rootId}-plot-group`;
    const xAxisGroupId = `${rootId}-x-axis-group`;
    const yAxisGroupId = `${rootId}-y-axis-group`;
    const lollipopGroupId = `${rootId}-lollipop-group`;
    const gXElement = () => rootElement().select(`#${xAxisGroupId}`);
    const gYElement = () => rootElement().select(`#${yAxisGroupId}`);
    const lollipopLineId = (isoCode: IsoCode) => `${lollipopGroupId}-line-${isoCode}`.toLowerCase();
    const lollipopLineElement = (isoCode: IsoCode) =>
        rootElement().select(`#${lollipopLineId(isoCode)}`);
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
            visible: true,
            xPos: event.pageX - 60,
            yPos: event.pageY - 60,
            lollipopDataPoint: lollipopDataPoint
        });
    }

    function hideTooltip() {
        setTooltipProps({
            ...tooltipProps,
            visible: false
        });
    }

    function handleMouseOver(event: MouseEvent, lollipopDataPoint: LollipopDataPoint) {
        lollipopCircleElement(lollipopDataPoint.country.iso_code)
            .transition()
            .attr('fill', colorScheme.palette.hovered);
        showTooltip(event, lollipopDataPoint);
    }

    function handleMouseMove(event: MouseEvent, lollipopDataPoint: LollipopDataPoint) {
        showTooltip(event, lollipopDataPoint);
    }

    function handleMouseOut(event: MouseEvent, lollipopDataPoint: LollipopDataPoint) {
        lollipopCircleElement(lollipopDataPoint.country.iso_code)
            .transition()
            .attr('fill', getLollipopCircleFill(lollipopDataPoint));
        hideTooltip();
    }

    useEffect(() => {
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
            .text(selectedRiskFactor);

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

        return cleanD3Elements;
    }, [width, height]);

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
    lollipopDataPoint: LollipopDataPoint;
};

function LollipopChartTooltip({
    visible,
    xPos,
    yPos,
    lollipopDataPoint
}: LollipopChartTooltipProps) {
    return (
        <div
            style={{ left: xPos, top: yPos, display: visible ? 'block' : 'none' }}
            className="p-2 absolute rounded-md text-white text-xs bg-blue-500"
        >
            <p>{lollipopDataPoint.country.location}</p>
        </div>
    );
}

export default LollipopChart;
