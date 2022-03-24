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
        iso_code: 'DEU',
        continent: 'Europe',
        location: 'Germany'
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

// Time is a concept we know surprisingly little about.
const now = new Date('2022-01-15T10:20:30Z');
const initialTimeRange = {
    start: dayjs(now).subtract(2, 'week').toDate(),
    end: now
};

const initialColorScheme = colorSchemes[0];

const initialRiskFactor: RiskFactor = 'cardiovasc_death_rate';

export { initialCountryList, initialTimeRange, initialColorScheme, initialRiskFactor };
