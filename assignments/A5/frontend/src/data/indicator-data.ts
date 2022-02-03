import { InfectionIndicator, RiskFactor } from '@models/covid-data-item';
import { snakeCaseToCapitalCase } from '@utils/string-utils';

const riskFactors = {
    aged_65_older: {
        description:
            'Share of the population that is 65 years and older, most recent year available'
    },
    median_age: {
        description: 'Median age of the population, UN projection for 2020'
    },
    gdp_per_capita: {
        description:
            'Gross domestic product at purchasing power parity (constant 2011 international dollars), most recent year available'
    },
    extreme_poverty: {
        description:
            'Share of the population living in extreme poverty, most recent year available since 2010'
    },
    cardiovasc_death_rate: {
        description:
            'Death rate from cardiovascular disease in 2017 (annual number of deaths per 100,000 people)'
    },
    diabetes_prevalence: {
        description: 'Diabetes prevalence (% of population aged 20 to 79) in 2017'
    },
    female_smokers: { description: 'Share of women who smoke, most recent year available' },
    male_smokers: { description: 'Share of men who smoke, most recent year available' }
};

const riskFactorData: Record<RiskFactor, { capitalized: string; description: string }> =
    Object.keys(riskFactors).reduce((acc, curr) => {
        return {
            ...acc,
            [curr as RiskFactor]: {
                capitalized: snakeCaseToCapitalCase(curr),
                description: riskFactors[curr as RiskFactor].description
            }
        };
    }, {} as Record<RiskFactor, { capitalized: string; description: string }>);

const infectionIndicators = {
    positive_rate: {
        description:
            'The share of COVID-19 tests that are positive, given as a rolling 7-day average (this is the inverse of tests_per_case)'
    },
    reproduction_rate: {
        description:
            'Real-time estimate of the effective reproduction rate (R) of COVID-19. See https://github.com/crondonm/TrackingR/tree/main/Estimates-Database'
    },
    total_deaths_per_million: {
        description: 'Total deaths attributed to COVID-19 per 1,000,000 people'
    },
    total_cases_per_million: {
        description: 'Total confirmed cases of COVID-19 per 1,000,000 people'
    },
    new_cases_smoothed_per_million: {
        description: 'New confirmed cases of COVID-19 (7-day smoothed) per 1,000,000 people'
    },
    new_deaths_smoothed_per_million: {
        description: 'New deaths attributed to COVID-19 (7-day smoothed) per 1,000,000 people'
    },
    weekly_icu_admissions_per_million: {
        description:
            'Number of COVID-19 patients newly admitted to intensive care units (ICUs) in a given week per 1,000,000 people'
    },
    weekly_hosp_admissions_per_million: {
        description:
            'Number of COVID-19 patients newly admitted to hospitals in a given week per 1,000,000 people'
    }
};

const infectionIndicatorData: Record<
    InfectionIndicator,
    { capitalized: string; description: string }
> = Object.keys(infectionIndicators).reduce((acc, curr) => {
    return {
        ...acc,
        [curr as InfectionIndicator]: {
            capitalized: snakeCaseToCapitalCase(curr),
            description: infectionIndicators[curr as InfectionIndicator].description
        }
    };
}, {} as Record<InfectionIndicator, { capitalized: string; description: string }>);

export { riskFactorData, infectionIndicatorData };
