import { getCovidDataQueryFetchProps } from '@services/covid-data-service';
import useFetch from '@hooks/useFetch';
import { GeoLocation } from '@models/geo-location';
import { CovidDataItem } from '@models/covid-data-item';
import { dateFromString } from '@utils/date-utils';
import { useUserConfig } from '@contexts/user-config/UserConfigContext';

function useAllGeoLocations() {
    const fetchProps = getCovidDataQueryFetchProps('ALL_GEO_LOCATION');
    const { url, params } = fetchProps;
    const { data, isLoading, hasError } = useFetch(url, params);
    return {
        data: isLoading || hasError ? undefined : (data as any[]).map(parseGeoLocation),
        isLoading
    };
}

function useCovidData(countries: GeoLocation[], timeRange: { start: Date; end: Date }) {
    const fetchProps = getCovidDataQueryFetchProps('DATA_BY_COUNTRIES_AND_TIME_RANGE', {
        countries,
        timeRange
    });
    const { url, params } = fetchProps;
    const { data, isLoading, hasError } = useFetch(url, params);
    return {
        data: isLoading || hasError ? undefined : (data as any[]).map(parseCovidDataItem),
        isLoading
    };
}

function useCovidDataOfSelectedCountries() {
    const {
        state: { selectedCountries, selectedTimeRange }
    } = useUserConfig();
    return useCovidData(selectedCountries, selectedTimeRange);
}

function useCovidDataOfSelectedCountry() {
    const {
        state: { selectedCountry, selectedTimeRange }
    } = useUserConfig();
    const { data, isLoading } = useCovidData([selectedCountry], selectedTimeRange);
    return {
        data: isLoading ? undefined : data,
        isLoading
    };
}

function parseGeoLocation(data: any): GeoLocation {
    return {
        iso_code: data['iso_code'],
        continent: data['continent'],
        location: data['location']
    };
}

function parseCovidDataItem(data: any): CovidDataItem {
    return {
        geo_location: parseGeoLocation(data),
        date: dateFromString(data['date']),
        total_cases: data['total_cases'],
        new_cases: data['new_cases'],
        positive_rate: data['positive_rate'],
        people_vaccinated: data['people_vaccinated'],
        population: data['population'],
        median_age: data['median_age'],
        gdp_per_capita: data['gdp_per_capita'],
        extreme_poverty: data['extreme_poverty'],
        cardiovasc_death_rate: data['cardiovasc_death_rate'],
        diabetes_prevalence: data['diabetes_prevalence'],
        female_smokers: data['female_smokers'],
        male_smokers: data['male_smokers'],
        handwashing_facilities: data['handwashing_facilities']
    };
}

export { useAllGeoLocations, useCovidDataOfSelectedCountries, useCovidDataOfSelectedCountry };