import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.css';
import App from './App';
import { OCDQueryConfigProvider } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { UserConfigProvider } from '@contexts/user-config/UserConfigContext';
import AdapterDayjs from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { FetchedCovidDataProvider } from '@contexts/fetched-covid-data/FetchedCovidDataContext';

ReactDOM.render(
    <React.StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <OCDQueryConfigProvider>
                <UserConfigProvider>
                    <FetchedCovidDataProvider>
                        <App />
                    </FetchedCovidDataProvider>
                </UserConfigProvider>
            </OCDQueryConfigProvider>
        </LocalizationProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
