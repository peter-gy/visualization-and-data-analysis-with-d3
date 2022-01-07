import { getCovidDataQueryFetchProps } from '@services/covid-data-service';
import useFetch from '@hooks/useFetch';
import { GeoLocation } from '@models/geo-location';

function useAllGeoLocations() {
    const fetchProps = getCovidDataQueryFetchProps('ALL_GEO_LOCATION');
    const { url, params } = fetchProps;
    const { data, isLoading, hasError } = useFetch(url, params);
    return {
        data: isLoading || hasError ? undefined : (data as GeoLocation[]),
        isLoading
    };
}

export { useAllGeoLocations };
