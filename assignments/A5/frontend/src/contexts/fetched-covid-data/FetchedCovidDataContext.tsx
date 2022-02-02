import { CovidDataItem } from '@models/covid-data-item';
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import CovidDataQueryGuard from '@components/utils/CovidDataQueryGuard';
import { State as UserConfigState, useUserConfig } from '@contexts/user-config/UserConfigContext';
import { useCovidDataForAllCountries } from '@hooks/ocd-query-hooks';

/**
 * Possible actions to dispatch to the reducer
 */
type Action = {
    type: 'SET_COVID_DATA_ITEMS';
    data: { covidDataItems: CovidDataItem[]; userConfig: UserConfigState };
};

/**
 * Dispatch callback signature
 */
type Dispatch = (action: Action) => void;

/**
 * State model signature to be mutated from the UI
 */
type State = {
    /**
     * The fetched covid data items
     */
    covidDataItems: CovidDataItem[];
    /**
     * The user config which was used to fetch the data
     */
    userConfig?: UserConfigState;
};

type FetchedCovidDataContextType = {
    state: State;
    dispatch: Dispatch;
};

const FetchedCovidDataContext = createContext<FetchedCovidDataContextType | undefined>(undefined);

function fetchedCovidDataReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_COVID_DATA_ITEMS':
            return {
                ...state,
                covidDataItems: action.data.covidDataItems,
                userConfig: action.data.userConfig
            };
    }
}

type FetchedCovidDataProviderProps = {
    children: ReactNode;
};

function FetchedCovidDataProvider({ children }: FetchedCovidDataProviderProps): JSX.Element {
    const [state, dispatch] = useReducer(fetchedCovidDataReducer, {
        covidDataItems: []
    });
    const { state: userConfigState } = useUserConfig();
    const { data, isLoading } = useCovidDataForAllCountries(userConfigState.selectedTimeRange);

    // Init provider data from remote source
    useEffect(() => {
        if (!isLoading && data !== undefined) {
            dispatch({
                type: 'SET_COVID_DATA_ITEMS',
                data: { covidDataItems: data, userConfig: userConfigState }
            });
        }
    }, [isLoading]);

    return (
        <FetchedCovidDataContext.Provider value={{ state, dispatch }}>
            <CovidDataQueryGuard<typeof data>
                data={data}
                isLoading={isLoading}
                children={children}
            />
        </FetchedCovidDataContext.Provider>
    );
}

/**
 * Exposes the fetched covid data to be consumed
 */
function useFetchedCovidData() {
    const context = useContext(FetchedCovidDataContext);
    if (context === undefined) {
        throw new Error('useFetchedCovidData must be used within a FetchedCovidDataProvider');
    }
    return context;
}

export { FetchedCovidDataProvider, useFetchedCovidData };
