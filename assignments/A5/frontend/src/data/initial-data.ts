import { colorSchemes } from '@models/color-scheme';
import { RiskFactor } from '@models/covid-data-item';
import { GeoLocation } from '@models/geo-location';
import dayjs from 'dayjs';

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

const now = new Date();
const initialTimeRange = {
    start: dayjs(now).subtract(2, 'week').toDate(),
    end: now
};

const initialColorScheme = colorSchemes[0];

const initialRiskFactor: RiskFactor = 'cardiovasc_death_rate';

export { initialCountryList, initialTimeRange, initialColorScheme, initialRiskFactor };
