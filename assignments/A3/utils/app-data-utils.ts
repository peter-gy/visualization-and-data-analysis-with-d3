import { startYear, endYear } from '@models/state-data';
import { StateData } from '@models/state-data';

export function getStateDataValues(stateDataList: StateData[], year: number): number[] {
    return stateDataList.reduce<number[]>(
        (values, stateData) => [...values, getValueByYear(stateData, year)],
        [] as number[]
    );
}

export function getStateDataValue(stateDataList: StateData[], state: string, year: number): number {
    const stateData: StateData | undefined = stateDataList.find(({ state: s }) => s === state);
    if (!stateData) throw new Error(`State ${state} not found`);
    return getValueByYear(stateData, year);
}

export function stateDataExists(stateDataList: StateData[], state: string): boolean {
    return stateDataList.some((s) => s.state === state);
}

function getValueByYear(stateData: StateData, year: number): number {
    if (year < startYear || year > endYear) throw new Error(`Year ${year} is out of range`);
    return stateData.values[year - startYear];
}
