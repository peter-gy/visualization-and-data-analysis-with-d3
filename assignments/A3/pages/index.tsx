import type { NextPage } from 'next';
import YearSlider from '@components/YearSlider/year-slider';
import ChoroplethMap from '@components/ChoroplethMap/choropleth-map';
import ScatterPlot from '@components/ScatterPlot/scatter-plot';
import { useAppData } from '@components/AppDataProvider/app-data-context';

const Home: NextPage = () => {
    const {
        state: { selectedYear }
    } = useAppData();
    return (
        <div className="bg-primary p-4 flex flex-col justify-center items-center h-[100vh] text-white text-2xl">
            <h1>{selectedYear}</h1>
            <div className="m-1">
                <YearSlider />
            </div>
            <div className="flex justify-between items-center p-2">
                <div className="m-1 w-[49vw]">
                    <ScatterPlot />
                </div>
                <div className="m-1 w-[49vw]">
                    <ChoroplethMap />
                </div>
            </div>
        </div>
    );
};

export default Home;
