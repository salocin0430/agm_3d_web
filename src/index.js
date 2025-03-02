import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './tailwind.css'; // Estilos de Tailwind después
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { HelmetProvider } from 'react-helmet-async';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <HelmetProvider>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
    </HelmetProvider>
);
