import type { NextPage } from 'next';
import YearSlider from '@components/YearSlider/year-slider';
import UsaGeoJsonMap from '@components/GeoJsonMap/usa-geo-json-map';
import { useAppData } from '@components/AppDataProvider/app-data-context';

const Home: NextPage = () => {
    const {
        state: { selectedYear }
    } = useAppData();
    return (
        <div className="bg-primary p-4 flex flex-col justify-center items-center h-[100vh] text-white text-2xl">
            <h1>{selectedYear}</h1>
            <YearSlider />
            <UsaGeoJsonMap />
        </div>
    );
};

export default Home;
