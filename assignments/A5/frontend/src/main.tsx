import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.css';
import App from './App';
import { OCDQueryConfigProvider } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { CountrySelectionProvider } from '@contexts/country-selection/CountrySelectionContext';

ReactDOM.render(
    <React.StrictMode>
        <OCDQueryConfigProvider>
            <CountrySelectionProvider>
                <App />
            </CountrySelectionProvider>
        </OCDQueryConfigProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
