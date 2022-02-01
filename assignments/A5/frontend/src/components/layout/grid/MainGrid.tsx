import useMuiAppBarHeight from '@hooks/useMuiAppBarHeight';
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import ChoroplethMap from '@features/choropleth-map/ChoroplethMap';
import BarChart from '@features/bar-chart/BarChart';
import LollipopChart from '@features/lollipop-chart/LollipopChart';
import HeatMap from '@features/heatmap/HeatMap';
import { useCovidDataOfSelectedCountries } from '@hooks/ocd-query-hooks';

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
                    title="Map"
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

type GridItemProps = {
    title: string;
    appBarHeight: number;
    content?: ReactNode;
    contentContainerRef?: RefObject<HTMLDivElement>;
    className?: string;
};

function GridItem({
    title,
    appBarHeight,
    content = <div />,
    contentContainerRef,
    className = ''
}: GridItemProps) {
    const gridItemId = `grid-item-${title}`.toLowerCase();
    return (
        <div
            style={{
                height: 'calc(50vh - ' + appBarHeight / 1.25 + 'px)'
            }}
            className={
                'm-2 bg-white rounded-lg shadow-lg hover:shadow-2xl w-[95vw] lg:w-[47.5vw] flex flex-col justify-start items-center ' +
                className
            }
        >
            <h1 className="text-xl font-bold text-center my-2">{title}</h1>
            <div
                ref={contentContainerRef}
                id={gridItemId}
                className="grow flex justify-center items-center w-[100%]"
            >
                {content}
            </div>
        </div>
    );
}

export default MainGrid;
