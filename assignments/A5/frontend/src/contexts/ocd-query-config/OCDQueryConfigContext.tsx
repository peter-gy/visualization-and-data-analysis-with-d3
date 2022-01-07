import { useReducer, createContext, useContext, ReactNode, useEffect } from 'react';
import { GeoLocation } from '@models/geo-location';
import { useAllGeoLocations } from '@hooks/ocd-query-hooks';
import { initialCountryList } from '@data/initial-data';

type TimeRange = { start: Date; end: Date };

/**
 * Possible actions to dispatch to the reducer
 */
type Action =
    | { type: 'SET_COUNTRY_LIST'; data: GeoLocation[] }
    | { type: 'SET_TIME_RANGE'; data: TimeRange };

/**
 * Dispatch callback signature
 */
type Dispatch = (action: Action) => void;

/**
 * State model signature to be mutated from the UI
 */
type State = {
    countryList: GeoLocation[];
    timeRange: TimeRange;
};

type OCDQueryConfigContextType = {
    state: State;
    dispatch: Dispatch;
};

const OCDQueryConfigContext = createContext<OCDQueryConfigContextType | undefined>(undefined);

function covidDataReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_COUNTRY_LIST':
            return { ...state, countryList: action.data };
        case 'SET_TIME_RANGE':
            return { ...state, timeRange: action.data };
    }
}

type CovidDataProviderProps = {
    children: ReactNode;
};

function CovidDataProvider({ children }: CovidDataProviderProps): JSX.Element {
    const [state, dispatch] = useReducer(covidDataReducer, {
        countryList: initialCountryList,
        timeRange: { start: new Date(2020, 1), end: new Date(2022, 1) }
    });
    const { data, isLoading } = useAllGeoLocations();

    // Init provider data from remote source to
    useEffect(() => {
        if (!isLoading && data !== undefined) {
            dispatch({ type: 'SET_COUNTRY_LIST', data });
        }
    }, [isLoading]);
    return (
        <OCDQueryConfigContext.Provider value={{ state, dispatch }}>
            {children}
        </OCDQueryConfigContext.Provider>
    );
}

function useOCDQueryConfig(): OCDQueryConfigContextType {
    const context = useContext(OCDQueryConfigContext);
    if (context === undefined) {
        throw new Error('useCovidData must be used within a CovidDataProvider');
    }
    return context;
}

export { CovidDataProvider, useOCDQueryConfig };
