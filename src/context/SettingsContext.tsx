// SettingsContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  manualInjection: boolean;
  setManualInjection: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SettingsProviderProps {
    children: ReactNode;
  }

const defaultValues: SettingsContextType = {
  manualInjection: false,
  setManualInjection: () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultValues);

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [manualInjection, setManualInjection] = useState(defaultValues.manualInjection);

  useEffect(() => {
    // Load settings from local storage
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      setManualInjection(settings.manualInjection);
    }
  }, []);

  useEffect(() => {
    // Save settings to local storage
    const settings = { manualInjection };
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [manualInjection]);

  return (
    <SettingsContext.Provider value={{ manualInjection, setManualInjection }}>
      {children}
    </SettingsContext.Provider>
  );
};
