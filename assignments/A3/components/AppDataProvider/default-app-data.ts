import * as d3 from 'd3';
import educationRates from '@data/education-rates.json';
import personalIncome from '@data/personal-income.json';
import { StateData, startyYear, endYear } from '@models/state-data';

const educationRatesData: StateData[] = d3.csvParse(educationRates.data).map<StateData>((row) => ({
    state: row['State']!,
    values: d3.range(startyYear, endYear + 1).map<number>((year) => +row[year]!)
}));
const personalIncomeData: StateData[] = d3.csvParse(personalIncome.data).map<StateData>((row) => ({
    state: row['State']!,
    values: d3.range(startyYear, endYear + 1).map<number>((year) => +row[year]!)
}));

export { educationRatesData, personalIncomeData };
