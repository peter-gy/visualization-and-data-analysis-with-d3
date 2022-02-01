type HeatMapProps = {
    width: number;
    height: number;
};

function HeatMap({ width, height }: HeatMapProps) {
    return (
        <h1>
            I am a {width}x{height} heat map! Cool!
        </h1>
    );
}

export default HeatMap;
