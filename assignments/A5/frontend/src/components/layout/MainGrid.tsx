import useMuiAppBarHeight from '@hooks/useMuiAppBarHeight';
import { useMediaQuery } from '@mui/material';

function MainGrid() {
    const appBarHeight = useMuiAppBarHeight();
    return (
        <div
            style={{
                marginTop: appBarHeight,
                height: 'calc(100vh - ' + appBarHeight + 'px)'
            }}
            className="bg-amber-100 flex flex-col justify-start items-center overflow-scroll md:justify-center"
        >
            <div className="flex flex-col md:flex-row">
                <GridItem name="Map" />
                <GridItem name="Bars" />
            </div>
            <div className="flex flex-col md:flex-row">
                <GridItem name="Lollipop" />
                <GridItem name="Heatmap" />
            </div>
        </div>
    );
}

type GridItemProps = {
    name: string;
};

function GridItem({ name }: GridItemProps) {
    const appBarHeight = useMuiAppBarHeight();
    const matchesMdScreen = useMediaQuery('(min-width: 768px)');
    return (
        <div
            style={{
                height: matchesMdScreen
                    ? 'calc(50vh - ' + appBarHeight + 'px)'
                    : 'calc(100vh - 1.5rem - ' + appBarHeight + 'px)'
            }}
            className="m-2 bg-white rounded-lg shadow-lg p-4 w-[95vw] md:w-[47.5vw]"
        >
            <h1 className="text-2xl font-bold text-center">{name}</h1>
        </div>
    );
}

export default MainGrid;
