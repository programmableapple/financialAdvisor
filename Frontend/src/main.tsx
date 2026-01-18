import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './components/theme-provider'

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ThemeProvider defaultTheme="light" storageKey="financial-advisor-theme">
                <App />
            </ThemeProvider>
        </React.StrictMode>,
    )
}
