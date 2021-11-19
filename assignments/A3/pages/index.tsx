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
        <div className="bg-primary p-2 flex flex-col justify-between items-center h-[100vh] text-white text-xl text-center">
            <h1 className="m-1">
                <span className="block font-bold">
                    Overview about the Educational Attainment Rate and the Mean Income&#39;s
                    relationship in
                </span>
                <span className="block italic">{selectedYear}</span>
            </h1>
            <div className="m-1">
                <YearSlider />
            </div>
            <div className="bg-white mt-4 flex flex-col md:px-4 md md:flex-row justify-between items-center p-8 rounded-md">
                <div className="bg-white w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] flex justify-center items-center">
                    <ScatterPlot />
                </div>
                <div className="bg-white w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] flex justify-center items-center">
                    <ChoroplethMap />
                </div>
            </div>
            <div className="flex justify-center items-center p-4">
                <p className="text-white text-sm italic">Péter Ferenc Gyarmati - 11913446</p>
            </div>
        </div>
    );
};

export default Home;
