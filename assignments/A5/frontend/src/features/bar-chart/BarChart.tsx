type BarChartProps = {
    width: number;
    height: number;
};

function BarChart({ width, height }: BarChartProps) {
    return (
        <h1>
            I am a {width}x{height} bar chart! Awesome!
        </h1>
    );
}

export default BarChart;
