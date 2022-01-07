type CovidDataQuery = 'ALL_GEO_LOCATION';

const API_URL = `${import.meta.env.VITE_OCD_API_HOST}/owid_covid_data`;

type FetchProps = {
    url: string;
    params: Record<string, string>;
};

const geoLocationDataFetchProps: FetchProps = {
    url: API_URL,
    params: {
        use_distinct: `${true}`,
        iso_code_selected: `${true}`,
        // Return rows where the ISO code consists of 3 characters only (SQLite LIKE syntax)
        iso_code_like: '___',
        continent_selected: `${true}`,
        location_selected: `${true}`
    }
};

export function getCovidDataQueryFetchProps(query: CovidDataQuery, params: any = null): FetchProps {
    switch (query) {
        case 'ALL_GEO_LOCATION':
            return geoLocationDataFetchProps;
    }
}
