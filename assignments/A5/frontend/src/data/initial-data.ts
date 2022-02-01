import { GeoLocation } from '@models/geo-location';

const initialCountryList: GeoLocation[] = [
    {
        iso_code: 'AUT',
        continent: 'Europe',
        location: 'Austria'
    },
    {
        iso_code: 'FRA',
        continent: 'Europe',
        location: 'France'
    },
    {
        iso_code: 'DEU',
        continent: 'Europe',
        location: 'Germany'
    },
    {
        iso_code: 'HUN',
        continent: 'Europe',
        location: 'Hungary'
    },
    {
        iso_code: 'ITA',
        continent: 'Europe',
        location: 'Italy'
    },
    {
        iso_code: 'ESP',
        continent: 'Europe',
        location: 'Spain'
    },
    {
        iso_code: 'GBR',
        continent: 'Europe',
        location: 'United Kingdom'
    },
    {
        iso_code: 'USA',
        continent: 'North America',
        location: 'United States'
    }
];

const datasetStartDate = new Date(2020, 1);
const now = new Date();
const initialTimeRange = {
    start: datasetStartDate,
    end: new Date(now.getFullYear(), now.getMonth() + 1)
};

export { initialCountryList, initialTimeRange };
