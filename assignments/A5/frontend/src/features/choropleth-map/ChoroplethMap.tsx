type ChoroplethMapProps = {
    width: number;
    height: number;
};

function ChoroplethMap({ width, height }: ChoroplethMapProps) {
    return (
        <h1>
            I am a {width}x{height} map! Good for me!
        </h1>
    );
}

export default ChoroplethMap;
