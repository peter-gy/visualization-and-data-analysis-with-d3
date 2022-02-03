import { ColorScheme } from '@models/color-scheme';
import { CovidDataItem, InfectionIndicator, RiskFactor } from '@models/covid-data-item';
import { IsoCode } from '@models/geo-location';
import { groupBy } from '@utils/collection-utils';
import * as d3 from 'd3';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { infectionIndicatorData, riskFactorData } from '@data/indicator-data';

type HeatMapProps = {
    width: number;
    height: number;
    selectedCovidData: CovidDataItem[];
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
            return [
                ...innerAcc,
                {
                    x: outerCurr as RiskFactor,
                    y: innerCurr as InfectionIndicator,
                    correlation: pearsonCorrelation(riskFactorValues, indicatorValues)
                }
            ];
        }, [] as HeatMapDataPoint[]);
        return [...outerAcc, ...row];
    }, [] as HeatMapDataPoint[]);
}

function HeatMap({ width, height, selectedCovidData }: HeatMapProps) {
    const {
        state: { colorScheme }
    } = useUserConfig();

    const heatMapData = getAggregatedData(selectedCovidData);
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
    margin = 10
}: HeatMapFragmentProps) {
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
