import {
    getCovidDataQueryFetchProps,
    parseCovidDataItem,
    parseGeoLocation
} from '@services/covid-data-service';
import { useFetchedCovidData } from '@contexts/fetched-covid-data/FetchedCovidDataContext';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';
import useFetch from '@hooks/useFetch';

/**
 * Business logic to retrieve location data for all the countries available in the data set.
 */
function useAllGeoLocations() {
    const fetchProps = getCovidDataQueryFetchProps('ALL_GEO_LOCATION');
    const { url, params } = fetchProps;
    const { data, isLoading, hasError } = useFetch(url, params);
    return {
        data: isLoading || hasError ? undefined : (data as any[]).map(parseGeoLocation),
        isLoading
    };
}

/**
 * Business logic to retrieve covid data for all countries in a specific time range.
 * @param timeRange the time range to retrieve data for
 */
function useCovidDataForAllCountries(timeRange: { start: Date; end: Date }) {
    const fetchProps = getCovidDataQueryFetchProps('ALL_DATA_BY_TIME_RANGE', {
        timeRange
    });
    const { url, params } = fetchProps;
    const { data, isLoading, hasError } = useFetch(url, params);
    return {
        data: isLoading || hasError ? undefined : (data as any[]).map(parseCovidDataItem),
        isLoading
    };
}

/**
 * Convenience hook to retrieve the data for all selected countries in the selected time range.
 *
 * Uses `useUserConfig` and `useFetchedCovidData` under the hood.
 */
function useCovidDataOfSelectedCountries() {
    const {
        state: { selectedCountries }
    } = useUserConfig();
    const {
        state: { covidDataItems }
    } = useFetchedCovidData();
    return covidDataItems.filter(
        ({ geo_location: { iso_code } }) =>
            selectedCountries.find(
                ({ iso_code: selectedIsoCode }) => selectedIsoCode === iso_code
            ) !== undefined
    );
}

export { useCovidDataForAllCountries, useAllGeoLocations, useCovidDataOfSelectedCountries };
