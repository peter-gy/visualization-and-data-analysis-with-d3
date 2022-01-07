import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.css';
import App from './App';
import { CovidDataProvider } from '@contexts/ocd-query-config/OCDQueryConfigContext';

ReactDOM.render(
    <React.StrictMode>
        <CovidDataProvider>
            <App />
        </CovidDataProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
