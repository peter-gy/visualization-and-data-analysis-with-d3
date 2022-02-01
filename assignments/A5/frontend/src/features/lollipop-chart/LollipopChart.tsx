type LollipopChartProps = {
    width: number;
    height: number;
};

function LollipopChart({ width, height }: LollipopChartProps) {
    return (
        <h1>
            I am a {width}x{height} Lollipop chart! Awesome!
        </h1>
    );
}

export default LollipopChart;
