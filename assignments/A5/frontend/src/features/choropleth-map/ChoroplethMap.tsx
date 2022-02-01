import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import { useCovidDataOfSelectedCountries } from '@hooks/ocd-query-hooks';
import CovidDataQueryGuard from '@components/utils/CovidDataQueryGuard';
import { CovidDataItem } from '@models/covid-data-item';

type ChoroplethMapProps = {
    width: number;
    height: number;
};

function ChoroplethMap({ width, height }: ChoroplethMapProps) {
    const { dispatch } = useUserConfig();
    const { data, isLoading } = useCovidDataOfSelectedCountries();
    return (
        <CovidDataQueryGuard<typeof data>
            data={data}
            isLoading={isLoading}
            children={(d) => (
                <ChoroplethMapFragment width={width} height={height} data={d as CovidDataItem[]} />
            )}
        />
    );
}

type ChoroplethMapFragmentProps = {
    width: number;
    height: number;
    data: CovidDataItem[];
};

function ChoroplethMapFragment({ width, height, data }: ChoroplethMapFragmentProps) {
    return <p>{JSON.stringify(data[0].geo_location, null, 1)}</p>
}

export default ChoroplethMap;
