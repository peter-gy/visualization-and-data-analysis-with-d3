import { GeoLocation } from '@models/geo-location';

/**
 * Represents a row of the apified CSV file from the dataset
 * under https://github.com/owid/covid-19-data/tree/master/public/data
 */
export type CovidDataItem = {
    geo_location: GeoLocation;
    date: Date;
    total_cases: number;
    new_cases: number;
    positive_rate: number;
    people_vaccinated: number;
    population: number;
    median_age: number;
    gdp_per_capita: number;
    extreme_poverty: number;
    cardiovasc_death_rate: number;
    diabetes_prevalence: number;
    female_smokers: number;
    male_smokers: number;
    handwashing_facilities: number;
};
