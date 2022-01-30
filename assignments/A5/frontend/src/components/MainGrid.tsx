function MainGrid() {
    return (
        /* Adding top margin 64px for the app bar */
        <div className="mt-[64px] bg-amber-100 h-[calc(100vh-64px)] flex justify-center items-center flex-col">
            <div className="flex">
                <GridItem name="Map" />
                <GridItem name="Bars" />
            </div>
            <div className="flex">
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
    return (
        <div className="m-2 h-[calc(50vh-64px)] w-[48vw] bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center">{name}</h1>
        </div>
    );
}

export default MainGrid;
