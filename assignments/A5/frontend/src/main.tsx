import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.css';
import App from './App';
import { OCDQueryConfigProvider } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { UserConfigProvider } from '@contexts/user-config/UserConfigContext';
import AdapterDayjs from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

ReactDOM.render(
    <React.StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <OCDQueryConfigProvider>
                <UserConfigProvider>
                    <App />
                </UserConfigProvider>
            </OCDQueryConfigProvider>
        </LocalizationProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
