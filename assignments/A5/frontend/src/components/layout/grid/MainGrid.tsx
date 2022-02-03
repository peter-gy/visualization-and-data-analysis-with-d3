import ChoroplethMap from '@features/choropleth-map/ChoroplethMap';
import HeatMap from '@features/heatmap/HeatMap';
import LollipopChart from '@features/lollipop-chart/LollipopChart';
import ScatterPlot from '@features/scatter-plot/ScatterPlot';
import { useEffect, useRef, useState } from 'react';
import GridItem from '@components/layout/grid/GridItem';
import { useCovidDataOfSelectedCountries } from '@hooks/ocd-query-hooks';
import useMuiAppBarHeight from '@hooks/useMuiAppBarHeight';
import useSelectedRiskFactorData from '@hooks/useSelectedRiskFactorData';

function MainGrid() {
    const appBarHeight = useMuiAppBarHeight();
    const selectedRiskFactorData = useSelectedRiskFactorData();

    // All grid items have the same size, hence we track only the first one
    const trackedItemRef = useRef<HTMLDivElement>(null);
    const [gridItemContentSize, setGridItemContentSize] = useState<{
        width: number;
        height: number;
    }>({ width: 0, height: 0 });

    function updateGridItemContentSize() {
        if (trackedItemRef.current) {
            const width = trackedItemRef.current.clientWidth;
            const height = trackedItemRef.current.clientHeight;
            setGridItemContentSize({ width, height });
        }
    }

    // Access the fetched data
    const selectedCovidData = useCovidDataOfSelectedCountries();

    // Initialize grid item content size
    useEffect(() => {
        updateGridItemContentSize();
    }, [trackedItemRef.current]);

    // Update grid item content size on window resize
    useEffect(() => {
        window.addEventListener('resize', updateGridItemContentSize);
        return () => window.removeEventListener('resize', updateGridItemContentSize);
    }, []);

    return (
        <div
            style={{
                marginTop: appBarHeight,
                height: 'calc(100vh - ' + appBarHeight + 'px)'
            }}
            className="bg-primary flex flex-col justify-start items-center overflow-scroll snap-y snap-mandatory lg:justify-center"
        >
            <div className="flex flex-col lg:flex-row">
                <GridItem
                    className="snap-center"
                    title="Vaccination Rate vs. Infection Rate"
                    description={
                        <>
                            <p className="my-1">
                                This map gives an overview of the correlation between vaccination
                                rate and infection rate around the world,{' '}
                                <strong>averaged over the selected time range</strong>.
                            </p>
                            <p className="my-1">
                                <strong>Vaccination Rate</strong> stands for the number of COVID-19
                                vaccination doses administered per 100 people in the total
                                population.
                            </p>
                            <p className="my-1">
                                <strong>Infection Rate</strong> stands for the share of COVID-19
                                tests that are positive, given as a rolling 7-day average.
                            </p>
                        </>
                    }
                    appBarHeight={appBarHeight}
                    contentContainerRef={trackedItemRef}
                    content={
                        <ChoroplethMap
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                            selectedCovidData={selectedCovidData}
                        />
                    }
                />
                <GridItem
                    className="snap-center"
                    title="Full Vaccination Rate vs. Infection Rate"
                    description={
                        <>
                            <p className="my-1">
                                This scatter plot gives an overview of the correlation between full
                                vaccinations and infection rates around the world,{' '}
                                <strong>averaged over the selected time range</strong>.
                            </p>
                            <p className="my-1">
                                <strong>People Fully Vaccinated / 100</strong> stands for the total
                                number of people who received all doses prescribed by the
                                vaccination protocol per 100 people in the total population.
                            </p>
                            <p className="my-1">
                                <strong>Infection Rate</strong> stands for the share of COVID-19
                                tests that are positive, given as a rolling 7-day average.
                            </p>
                        </>
                    }
                    appBarHeight={appBarHeight}
                    content={
                        <ScatterPlot
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                            selectedCovidData={selectedCovidData}
                        />
                    }
                />
            </div>
            <div className="flex flex-col lg:flex-row">
                <GridItem
                    className="snap-center"
                    title={`${selectedRiskFactorData.capitalized} vs. Infection Rate`}
                    description={
                        <>
                            <p className="my-1">
                                This lollipop chart visualizes the relationship between the selected
                                risk factor and the infection rate among countries.
                            </p>
                            <p className="my-1">
                                You can set the selected risk factor in the control settings.
                            </p>
                            <p className="my-1">
                                <strong>{selectedRiskFactorData.capitalized}</strong>:{' '}
                                {selectedRiskFactorData.description}
                            </p>
                            <p className="my-1">
                                <strong>Infection Rate</strong> stands for the share of COVID-19
                                tests that are positive, given as a rolling 7-day average.
                            </p>
                        </>
                    }
                    appBarHeight={appBarHeight}
                    content={
                        <LollipopChart
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                            selectedCovidData={selectedCovidData}
                        />
                    }
                />
                <GridItem
                    className="snap-center"
                    title="Risk Factors vs. Infection Development"
                    description={
                        <>
                            <p className="my-1">
                                This heatmap gives an overview of the correlation between global
                                risk factors and infection development indicators.
                            </p>
                            <div className="my-1">
                                The correlation between the values is calculated using the{' '}
                                <a
                                    href="https://en.wikipedia.org/wiki/Pearson_correlation_coefficient"
                                    target="_blank"
                                    className="underline text-blue-500 hover:text-blue-700"
                                >
                                    Pearson correlation coefficient
                                </a>
                                .
                            </div>
                        </>
                    }
                    appBarHeight={appBarHeight}
                    content={
                        <HeatMap
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                        />
                    }
                />
            </div>
        </div>
    );
}

export default MainGrid;
