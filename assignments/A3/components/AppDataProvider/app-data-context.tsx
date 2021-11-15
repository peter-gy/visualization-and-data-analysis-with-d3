// Using React Context based on the hints of Kent C. Dodds: https://kentcdodds.com/blog/how-to-use-react-context-effectively
import { useReducer, createContext, useContext, ReactNode } from 'react';
import { StateData } from '@models/state-data';
import { educationRatesData, personalIncomeData } from './default-app-data';

/**
 * Possible actions to dispatch to the reducer
 */
type Action =
    | { type: 'setSelectedYear'; data: number }
    | { type: 'selectState'; data: string }
    | { type: 'deselectState'; data: string };

/**
 * Dispatch callback signature
 */
type Dispatch = (action: Action) => void;

/**
 * Type of the state to be mutated from the UI
 */
type State = {
    selectedYear: number;
    selectedStates: string[];
    educationRates: StateData[];
    personalIncome: StateData[];
};

type AppDataContextType = { state: State; dispatch: Dispatch };

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

function appDataReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setSelectedYear': {
            return {
                ...state,
                selectedYear: action.data
            };
        }
        case 'selectState': {
            return {
                ...state,
                selectedStates: [...state.selectedStates, action.data]
            };
        }
        case 'deselectState': {
            return {
                ...state,
                selectedStates: state.selectedStates.filter((state) => state !== action.data)
            };
        }
        default: {
            throw new Error(`Unhandled action type`);
        }
    }
}

type AppDataProviderProps = { children: ReactNode };

function AppDataProvider({ children }: AppDataProviderProps): JSX.Element {
    const [state, dispatch] = useReducer(appDataReducer, {
        selectedYear: 2006,
        selectedStates: [],
        educationRates: educationRatesData,
        personalIncome: personalIncomeData
    });

    return (
        <AppDataContext.Provider value={{ state, dispatch }}>{children}</AppDataContext.Provider>
    );
}

function useAppData(): AppDataContextType {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
}

export { AppDataProvider, useAppData };
