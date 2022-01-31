function MainGrid() {
    return (
        <div className="bg-amber-100 mt-[56px] h-[calc(100vh-56px)] flex flex-col justify-start items-center overflow-scroll sm:mt-[64px] md:h-[calc(100vh-64px)] md:justify-center">
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
    return (
        <div className="m-2 bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-1.5rem-56px)] w-[95vw] md:h-[calc(50vh-64px)] md:w-[47.5vw]">
            <h1 className="text-2xl font-bold text-center">{name}</h1>
        </div>
    );
}

export default MainGrid;
