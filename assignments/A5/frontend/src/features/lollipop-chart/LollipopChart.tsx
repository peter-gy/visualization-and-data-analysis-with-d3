import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem, RiskFactor } from '@models/covid-data-item';
import { GeoLocation, IsoCode } from '@models/geo-location';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { useEffect, useMemo } from 'react';
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
    const chartWidth = width - 6 * margin;
    const chartHeight = height - 2 * margin;

    const rootElement = () => d3.select(`#${rootId}`);
    const plotGroupId = `${rootId}-plot-group`;
    const xAxisGroupId = `${rootId}-x-axis-group`;
    const yAxisGroupId = `${rootId}-y-axis-group`;
    const lollipopGroupId = `${rootId}-lollipop-group`;
    const gXElement = () => rootElement().select(`#${xAxisGroupId}`);
    const gYElement = () => rootElement().select(`#${yAxisGroupId}`);

    // Rates for the univariate color generator & scales
    const bubbleValues = lollipopData.map(({ positive_rate }) => positive_rate).sort();
    const yValues = lollipopData.map(({ risk_factor_value }) => risk_factor_value).sort();

    const cleanD3Elements = () => {
        // Make sure that the only SVG tag inside the root div is the map
        d3.select(`#${rootId}`).selectAll('*').remove();
    };

    useEffect(() => {
        // Create the base SVG
        const svg = d3
            .select(`#${rootId}`)
            .append('svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .append('g')
            .attr('transform', `translate(${3.5 * margin}, ${margin})`);

        // x-axis
        const xScale = d3
            .scaleBand()
            .range([0, chartWidth])
            .domain(
                lollipopData
                    .map(({ country: { location } }) => location)
                    .reverse()
                    .slice(0, maxCountryCount)
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
            .domain([yValues[yValues.length - 1], yValues[0]])
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

        return cleanD3Elements;
    }, [width, height]);

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

export default LollipopChart;
