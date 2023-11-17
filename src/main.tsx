import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { SettingsProvider } from './context/SettingsContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <SettingsProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </SettingsProvider>
  </ThemeProvider>
)