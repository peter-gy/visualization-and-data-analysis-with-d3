import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.css';
import App from './App';
import { OCDQueryConfigProvider } from '@contexts/ocd-query-config/OCDQueryConfigContext';
import { UserConfigProvider } from '@contexts/user-config/UserConfigContext';

ReactDOM.render(
    <React.StrictMode>
        <OCDQueryConfigProvider>
            <UserConfigProvider>
                <App />
            </UserConfigProvider>
        </OCDQueryConfigProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
