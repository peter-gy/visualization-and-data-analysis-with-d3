import { GeoLocation } from '@models/geo-location';

/**
 * Represents a row of the apified CSV file from the dataset
 * under https://github.com/owid/covid-19-data/tree/master/public/data
 */
export type CovidDataItem = {
    geo_location: GeoLocation;
    date: Date;
    positive_rate: number;
    people_vaccinated_per_hundred: number;
    people_fully_vaccinated_per_hundred: number;
    aged_65_older: number;
    median_age: number;
    gdp_per_capita: number;
    extreme_poverty: number;
    cardiovasc_death_rate: number;
    diabetes_prevalence: number;
    female_smokers: number;
    male_smokers: number;
    reproduction_rate: number;
    total_deaths_per_million: number;
    total_cases_per_million: number;
    new_cases_smoothed_per_million: number;
    new_deaths_smoothed_per_million: number;
    weekly_icu_admissions_per_million: number;
    weekly_hosp_admissions_per_million: number;
};

/**
 * Denotes the data status of a country
 */
export type CountryStatus = 'notInDataSet' | 'notSelected' | 'selected' | 'dataUnavailable';

export type RiskFactor =
    | 'aged_65_older'
    | 'median_age'
    | 'gdp_per_capita'
    | 'extreme_poverty'
    | 'cardiovasc_death_rate'
    | 'diabetes_prevalence'
    | 'female_smokers'
    | 'male_smokers';

export type InfectionIndicator =
    | 'positive_rate'
    | 'reproduction_rate'
    | 'total_deaths_per_million'
    | 'total_cases_per_million'
    | 'new_cases_smoothed_per_million'
    | 'new_deaths_smoothed_per_million'
    | 'weekly_icu_admissions_per_million'
    | 'weekly_hosp_admissions_per_million';
