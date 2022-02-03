import { CovidDataItem } from '@models/covid-data-item';
import { GeoLocation } from '@models/geo-location';
import { dateFromString, dateToString } from '@utils/date-utils';

type CovidDataQuery = 'ALL_GEO_LOCATION' | 'ALL_DATA_BY_TIME_RANGE';

// data can be queried by pinging the /owid_covid_data endpoint
const API_URL = `${import.meta.env.VITE_OCD_API_HOST}/owid_covid_data`;

type FetchProps = {
    url: string;
    params: Record<string, string>;
};

function buildSelectionParams(propNames: string[]): Record<string, string> {
    // query params: ${propName}_selected=true
    return propNames.reduce(
        (obj, propName) => ({ ...obj, [`${propName}_selected`]: `${true}` }),
        {}
    );
}

const geoLocationDataFetchProps: FetchProps = {
    url: API_URL,
    params: {
        use_distinct: `${true}`,
        // Return rows where the ISO code consists of 3 characters only (SQLite LIKE syntax)
        // There are aggregate rows with OWID_ prefix which we want to ignore
        iso_code_like: '___',
        ...buildSelectionParams(['iso_code', 'continent', 'location'])
    }
};

function dataForAllCountriesByTimeRangeFetchProps(timeRange: {
    start: Date;
    end: Date;
}): FetchProps {
    const dateIsAfterParam = dateToString(timeRange.start);
    const dateIsBeforeParam = dateToString(timeRange.end);
    return {
        url: API_URL,
        params: {
            // Return rows where the ISO code consists of 3 characters only (SQLite LIKE syntax)
            // There are aggregate rows with OWID_ prefix which we want to ignore
            iso_code_like: '___',
            date_isBefore: `${dateIsBeforeParam}`,
            date_isAfter: `${dateIsAfterParam}`,
            ...buildSelectionParams([
                'iso_code',
                'continent',
                'location',
                'date',
                'positive_rate',
                'people_vaccinated_per_hundred',
                'people_fully_vaccinated_per_hundred',
                'aged_65_older',
                'median_age',
                'gdp_per_capita',
                'extreme_poverty',
                'cardiovasc_death_rate',
                'diabetes_prevalence',
                'female_smokers',
                'male_smokers',
                'reproduction_rate',
                'total_deaths_per_million',
                'total_cases_per_million',
                'new_cases_smoothed_per_million',
                'new_deaths_smoothed_per_million',
                'weekly_icu_admissions_per_million',
                'weekly_hosp_admissions_per_million'
            ])
        }
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
        positive_rate: data['positive_rate'],
        people_vaccinated_per_hundred: data['people_vaccinated_per_hundred'],
        people_fully_vaccinated_per_hundred: data['people_fully_vaccinated_per_hundred'],
        aged_65_older: data['aged_65_older'],
        median_age: data['median_age'],
        gdp_per_capita: data['gdp_per_capita'],
        extreme_poverty: data['extreme_poverty'],
        cardiovasc_death_rate: data['cardiovasc_death_rate'],
        diabetes_prevalence: data['diabetes_prevalence'],
        female_smokers: data['female_smokers'],
        male_smokers: data['male_smokers'],
        reproduction_rate: data['reproduction_rate'],
        total_deaths_per_million: data['total_deaths_per_million'],
        total_cases_per_million: data['total_cases_per_million'],
        new_cases_smoothed_per_million: data['new_cases_smoothed_per_million'],
        new_deaths_smoothed_per_million: data['new_deaths_smoothed_per_million'],
        weekly_icu_admissions_per_million: data['weekly_icu_admissions_per_million'],
        weekly_hosp_admissions_per_million: data['weekly_hosp_admissions_per_million']
    };
}

function getCovidDataQueryFetchProps(query: CovidDataQuery, params: any = null): FetchProps {
    switch (query) {
        case 'ALL_GEO_LOCATION':
            return geoLocationDataFetchProps;
        case 'ALL_DATA_BY_TIME_RANGE':
            const allDataByTimeRangeParams = params as {
                timeRange: { start: Date; end: Date };
            };
            const { timeRange: allDataByTimeRangeTimeRange } = allDataByTimeRangeParams;
            return dataForAllCountriesByTimeRangeFetchProps(allDataByTimeRangeTimeRange);
    }
}

export { getCovidDataQueryFetchProps, parseGeoLocation, parseCovidDataItem };
