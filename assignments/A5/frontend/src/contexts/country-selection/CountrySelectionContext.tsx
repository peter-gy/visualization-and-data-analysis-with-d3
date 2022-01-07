import { GeoLocation } from '@models/geo-location';
import { createContext, ReactNode, useContext, useReducer } from 'react';
import { initialCountryList } from '@data/initial-data';

/**
 * Possible actions to dispatch to the reducer
 */
type Action =
    | { type: 'SET_SELECTED_COUNTRY'; data: GeoLocation }
    | { type: 'ADD_TO_SELECTED_COUNTRIES'; data: GeoLocation }
    | { type: 'REMOVE_FROM_SELECTED_COUNTRIES'; data: GeoLocation };

/**
 * Dispatch callback signature
 */
type Dispatch = (action: Action) => void;

/**
 * State model signature to be mutated from the UI
 */
type State = {
    /**
     * Selection for charts which display data about multiple countries
     */
    selectedCountries: GeoLocation[];
    /**
     * Selection for charts which display data about a single country
     */
    selectedCountry: GeoLocation;
};

type CountrySelectionContextType = {
    state: State;
    dispatch: Dispatch;
};

const CountrySelectionContext = createContext<CountrySelectionContextType | undefined>(undefined);

function countrySelectionReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD_TO_SELECTED_COUNTRIES':
            return state;
        case 'REMOVE_FROM_SELECTED_COUNTRIES':
            return state;
        case 'SET_SELECTED_COUNTRY':
            return state;
    }
}

type CountrySelectionProviderProps = {
    children: ReactNode;
};

function CountrySelectionProvider({ children }: CountrySelectionProviderProps): JSX.Element {
    const [state, dispatch] = useReducer(countrySelectionReducer, {
        selectedCountry: initialCountryList[0],
        selectedCountries: initialCountryList
    });
    return (
        <CountrySelectionContext.Provider value={{ state, dispatch }}>
            {children}
        </CountrySelectionContext.Provider>
    );
}

/**
 * Exposes the country selections to be used by the charts
 */
function useCountrySelection() {
    const context = useContext(CountrySelectionContext);
    if (context === undefined) {
        throw new Error('useCountrySelection must be used within a CountrySelectionContext');
    }
    return context;
}

export { CountrySelectionProvider, useCountrySelection };
