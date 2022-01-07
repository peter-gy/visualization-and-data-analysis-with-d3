import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.css';
import App from './App';
import { CovidDataProvider } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { CountrySelectionProvider } from '@contexts/country-selection/CountrySelectionContext';

ReactDOM.render(
    <React.StrictMode>
        <CovidDataProvider>
            <CountrySelectionProvider>
                <App />
            </CountrySelectionProvider>
        </CovidDataProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
