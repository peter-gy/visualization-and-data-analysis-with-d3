import { startYear, endYear } from '@models/state-data';
import { StateData } from '@models/state-data';

/**
 *
 * @param stateDataList the list of state data to look through
 * @param state the name of the state to look for
 * @param year the year to look for
 * @returns the value for the specified state and year
 */
export function getStateData(stateDataList: StateData[], state: string, year: number): number {
    if (year < startYear || year > endYear) throw new Error(`Year ${year} is out of range`);
    const stateData: StateData | undefined = stateDataList.find(({ state: s }) => s === state);
    if (!stateData) throw new Error(`State ${state} not found`);
    return stateData!.values[year - startYear];
}
