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
        <div className="bg-primary p-4 flex flex-col justify-start items-center h-[100vh] text-white text-xl text-center">
            <h1 className="m-2">
                <span className="block">
                    Overview about the Educational Attainment Rate and the Mean Incomes relationship
                    in
                </span>
                <span className="block italic">{selectedYear}</span>
            </h1>
            <div className="m-2">
                <YearSlider />
            </div>
            <div className="m-2 flex justify-between items-center p-2">
                <div className="bg-white m-1 w-[47.5vw] h-[47.5vw] flex justify-center items-center rounded-md">
                    <ScatterPlot />
                </div>
                <div className="bg-white m-1 w-[47.5vw] h-[47.5vw] flex justify-center items-center rounded-md">
                    <ChoroplethMap />
                </div>
            </div>
        </div>
    );
};

export default Home;
