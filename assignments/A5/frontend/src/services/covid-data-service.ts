import { dateToString } from '@utils/date-utils';

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
                'total_cases',
                'new_cases',
                'positive_rate',
                'people_vaccinated',
                'people_vaccinated_per_hundred',
                'people_fully_vaccinated_per_hundred',
                'population',
                'median_age',
                'gdp_per_capita',
                'extreme_poverty',
                'cardiovasc_death_rate',
                'diabetes_prevalence',
                'female_smokers',
                'male_smokers',
                'handwashing_facilities'
            ])
        }
    };
}

export function getCovidDataQueryFetchProps(query: CovidDataQuery, params: any = null): FetchProps {
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
