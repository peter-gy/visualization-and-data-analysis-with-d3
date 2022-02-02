import { GeoLocation, IsoCode } from '@models/geo-location';
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import CovidDataQueryGuard from '@components/utils/CovidDataQueryGuard';
import { initialCountryList, initialTimeRange } from '@data/initial-data';
import { useAllGeoLocations } from '@hooks/ocd-query-hooks';

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
    /**
     * All the countries which are supported by the dataset
     */
    countryList: GeoLocation[];
    /**
     * The time range which can be configured by the user
     */
    timeRange: TimeRange;
    /**
     * Quick lookup by iso code
     */
    countriesByIsoCode: Record<IsoCode, GeoLocation>;
};

type OCDQueryConfigContextType = {
    state: State;
    dispatch: Dispatch;
};

const OCDQueryConfigContext = createContext<OCDQueryConfigContextType | undefined>(undefined);

function ocdQueryConfigReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_COUNTRY_LIST':
            return {
                ...state,
                countryList: action.data,
                countriesByIsoCode: action.data.reduce(
                    (acc, country) => ({ ...acc, [country.iso_code]: country }),
                    {} as Record<IsoCode, GeoLocation>
                )
            };
        case 'SET_TIME_RANGE':
            return { ...state, timeRange: action.data };
    }
}

type CovidDataProviderProps = {
    children: ReactNode;
};

function OCDQueryConfigProvider({ children }: CovidDataProviderProps): JSX.Element {
    const [state, dispatch] = useReducer(ocdQueryConfigReducer, {
        countryList: initialCountryList,
        timeRange: initialTimeRange,
        countriesByIsoCode: {} as Record<IsoCode, GeoLocation>
    });
    const { data, isLoading } = useAllGeoLocations();

    // Init provider data from remote source to set the list of supported countries dynamically
    useEffect(() => {
        if (!isLoading && data !== undefined) {
            dispatch({ type: 'SET_COUNTRY_LIST', data });
        }
    }, [isLoading]);

    return (
        <OCDQueryConfigContext.Provider value={{ state, dispatch }}>
            <CovidDataQueryGuard<typeof data>
                data={data}
                isLoading={isLoading}
                children={children}
            />
        </OCDQueryConfigContext.Provider>
    );
}

/**
 * Exposes the base query configuration to be used to create data queries for the
 * configured time period and for countries chosen from the stored countryList.
 */
function useOCDQueryConfig(): OCDQueryConfigContextType {
    const context = useContext(OCDQueryConfigContext);
    if (context === undefined) {
        throw new Error('useCovidData must be used within a CovidDataProvider');
    }
    return context;
}

export { OCDQueryConfigProvider, useOCDQueryConfig };
