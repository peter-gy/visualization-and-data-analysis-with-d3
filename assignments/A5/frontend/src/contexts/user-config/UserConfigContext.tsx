import { GeoLocation } from '@models/geo-location';
import { createContext, ReactNode, useContext, useReducer } from 'react';
import { initialCountryList, initialTimeRange } from '@data/initial-data';
import { ColorScheme, colorSchemes } from '@models/color-scheme';

type TimeRange = { start: Date; end: Date };

/**
 * Possible actions to dispatch to the reducer
 */
type Action =
    | { type: 'SET_SELECTED_COUNTRY'; data: GeoLocation }
    | { type: 'SET_SELECTED_COUNTRIES'; data: GeoLocation[] }
    | { type: 'ADD_TO_SELECTED_COUNTRIES'; data: GeoLocation }
    | { type: 'REMOVE_FROM_SELECTED_COUNTRIES'; data: GeoLocation }
    | { type: 'SET_SELECTED_TIME_RANGE'; data: TimeRange }
    | { type: 'SET_COLOR_SCHEME'; data: ColorScheme };

/**
 * Dispatch callback signature
 */
type Dispatch = (action: Action) => void;

/**
 * State model signature to be mutated from the UI
 */
export type State = {
    /**
     * Selection for charts which display data about multiple countries
     */
    selectedCountries: GeoLocation[];
    /**
     * Selection for charts which display data about a single country
     */
    selectedCountry: GeoLocation;
    /**
     * Time range for the data to be displayed
     */
    selectedTimeRange: TimeRange;
    /**
     * Color scheme to be used for the charts
     */
    colorScheme: ColorScheme;
};

type UserConfigContextType = {
    state: State;
    dispatch: Dispatch;
};

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

function userConfigReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD_TO_SELECTED_COUNTRIES':
            return {
                ...state,
                selectedCountries: [...state.selectedCountries, action.data]
            };
        case 'SET_SELECTED_COUNTRIES':
            return {
                ...state,
                selectedCountries: action.data
            };
        case 'REMOVE_FROM_SELECTED_COUNTRIES':
            return {
                ...state,
                selectedCountries: state.selectedCountries.filter(
                    (country) => country.iso_code !== action.data.iso_code
                )
            };
        case 'SET_SELECTED_COUNTRY':
            return {
                ...state,
                selectedCountry: action.data
            };
        case 'SET_SELECTED_TIME_RANGE':
            return {
                ...state,
                selectedTimeRange: action.data
            };
        case 'SET_COLOR_SCHEME':
            return {
                ...state,
                colorScheme: action.data
            };
    }
}

type UserConfigProviderProps = {
    children: ReactNode;
};

function UserConfigProvider({ children }: UserConfigProviderProps): JSX.Element {
    const [state, dispatch] = useReducer(userConfigReducer, {
        selectedCountry: initialCountryList[0],
        selectedCountries: initialCountryList,
        selectedTimeRange: initialTimeRange,
        colorScheme: colorSchemes[0]
    });
    return (
        <UserConfigContext.Provider value={{ state, dispatch }}>
            {children}
        </UserConfigContext.Provider>
    );
}

/**
 * Exposes the country selections to be used by the charts
 */
function useUserConfig() {
    const context = useContext(UserConfigContext);
    if (context === undefined) {
        throw new Error('useUserConfig must be used within a UserConfigContext');
    }
    return context;
}

export { UserConfigProvider, useUserConfig };
