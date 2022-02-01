import useMuiAppBarHeight from '@hooks/useMuiAppBarHeight';
import { useMediaQuery } from '@mui/material';
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import ChoroplethMap from '@features/choropleth-map/ChoroplethMap';
import BarChart from '@features/bar-chart/BarChart';
import LollipopChart from '@features/lollipop-chart/LollipopChart';
import HeatMap from '@features/heatmap/HeatMap';

function MainGrid() {
    const appBarHeight = useMuiAppBarHeight();
    const matchesMdScreen = useMediaQuery('(min-width:768px)');
    const gridItemVariant = matchesMdScreen ? 'half' : 'full';

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
            className="bg-amber-100 flex flex-col justify-start items-center overflow-scroll md:justify-center"
        >
            <div className="flex flex-col md:flex-row">
                <GridItem
                    title="Map"
                    variant={gridItemVariant}
                    appBarHeight={appBarHeight}
                    contentContainerRef={trackedItemRef}
                    content={
                        <ChoroplethMap
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                        />
                    }
                />
                <GridItem
                    title="Bars"
                    variant={gridItemVariant}
                    appBarHeight={appBarHeight}
                    content={
                        <BarChart
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                        />
                    }
                />
            </div>
            <div className="flex flex-col md:flex-row">
                <GridItem
                    title="Lollipop"
                    variant={gridItemVariant}
                    appBarHeight={appBarHeight}
                    content={
                        <LollipopChart
                            width={gridItemContentSize.width}
                            height={gridItemContentSize.height}
                        />
                    }
                />
                <GridItem
                    title="Heatmap"
                    variant={gridItemVariant}
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
    variant?: 'full' | 'half';
    contentContainerRef?: RefObject<HTMLDivElement>;
};

function GridItem({
    title,
    appBarHeight,
    content = <div />,
    variant = 'half',
    contentContainerRef
}: GridItemProps) {
    const gridItemId = `grid-item-${title}`.toLowerCase();
    return (
        <div
            style={{
                height:
                    variant === 'half'
                        ? 'calc(50vh - ' + appBarHeight + 'px)'
                        : 'calc(100vh - 1.5rem - ' + appBarHeight + 'px)'
            }}
            className="m-2 bg-white rounded-lg shadow-lg p-2 w-[95vw] md:w-[47.5vw] flex flex-col justify-start items-center"
        >
            <h1 className="text-2xl font-bold text-center">{title}</h1>
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
