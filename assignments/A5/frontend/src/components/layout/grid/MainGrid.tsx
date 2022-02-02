import BarChart from '@features/bar-chart/BarChart';
import ChoroplethMap from '@features/choropleth-map/ChoroplethMap';
import HeatMap from '@features/heatmap/HeatMap';
import LollipopChart from '@features/lollipop-chart/LollipopChart';
import { useEffect, useRef, useState } from 'react';
import GridItem from '@components/layout/grid/GridItem';
import { useCovidDataOfSelectedCountries } from '@hooks/ocd-query-hooks';
import useMuiAppBarHeight from '@hooks/useMuiAppBarHeight';

function MainGrid() {
    const appBarHeight = useMuiAppBarHeight();

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
            className="bg-amber-100 flex flex-col justify-start items-center overflow-scroll snap-y snap-mandatory lg:justify-center"
        >
            <div className="flex flex-col lg:flex-row">
                <GridItem
                    className="snap-center"
                    title="Vaccination Rate vs. Infection Rate"
                    description={
                        <>
                            <p className='my-1'>
                                This map gives an overview of the correlation between
                                vaccination rate and infection rate around the world,{' '}
                                <strong>averaged over the selected time range</strong>.
                            </p>
                            <p className='my-1'>
                                <strong>Vaccination Rate</strong> stands for the number of COVID-19 vaccination doses
                                administered per 100 people in the total population.
                            </p>
                            <p className='my-1'>
                                <strong>Positive Rate</strong> stands for the share of COVID-19 tests that are
                                positive, given as a rolling 7-day average.
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
                    title="Bars"
                    appBarHeight={appBarHeight}
                    content={
                        <BarChart
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                        />
                    }
                />
            </div>
            <div className="flex flex-col lg:flex-row">
                <GridItem
                    className="snap-center"
                    title="Lollipop"
                    appBarHeight={appBarHeight}
                    content={
                        <LollipopChart
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                        />
                    }
                />
                <GridItem
                    className="snap-center"
                    title="Heatmap"
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
