import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem } from '@models/covid-data-item';
import { IsoCode } from '@models/geo-location';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { useEffect, useMemo } from 'react';
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

function ScatterPlot({ width, height, selectedCovidData }: ScatterPlotProps) {
    const {
        state: { colorScheme }
    } = useUserConfig();
    const meansByIsoCode = useMemo(() => getAggregatedData(selectedCovidData), [selectedCovidData]);
    return <BarChartFragment width={width} height={height} colorScheme={colorScheme} />;
}

type ScatterPlotFragmentProps = {
    width: number;
    height: number;
    colorScheme: ColorScheme;
    rootId?: string;
    margin?: number;
};

function BarChartFragment({
    width,
    height,
    colorScheme,
    rootId = 'scatter-plot',
    margin = 10
}: ScatterPlotFragmentProps) {
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    const cleanD3Elements = () => {
        // Make sure that the only SVG tag inside the root div is the map
        d3.select(`#${rootId}`).selectAll('*').remove();
    };

    useEffect(() => {
        // Create the SVG element of the map
        const svg = d3
            .select(`#${rootId}`)
            .append('svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

        return cleanD3Elements;
    }, [width, height, colorScheme]);

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

export default ScatterPlot;
