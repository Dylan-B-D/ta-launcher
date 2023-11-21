// SettingsContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  manualInjection: boolean;
  setManualInjection: React.Dispatch<React.SetStateAction<boolean>>;
  tamodsVersion: string;
  setTAModsVersion: React.Dispatch<React.SetStateAction<string>>;
}

interface SettingsProviderProps {
    children: ReactNode;
  }

const defaultValues: SettingsContextType = {
  manualInjection: false,
  setManualInjection: () => {},
  tamodsVersion: "Release",
  setTAModsVersion: () => {},
};

const SettingsContext = createContext<SettingsContextType>(defaultValues);

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [manualInjection, setManualInjection ] = useState(defaultValues.manualInjection);

  const [tamodsVersion, setTAModsVersion] = useState<string>(
    () => localStorage.getItem('tamodsVersion') || 'Release'
  );
  useEffect(() => {
    // Load settings from local storage
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      setManualInjection(settings.manualInjection);
      localStorage.setItem('tamodsVersion', tamodsVersion);
    }
  }, [tamodsVersion]);

  useEffect(() => {
    // Save settings to local storage
    const settings = { manualInjection, tamodsVersion };
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [manualInjection, tamodsVersion]);

  return (
    <SettingsContext.Provider value={{ manualInjection, setManualInjection, tamodsVersion, setTAModsVersion }}>
      {children}
    </SettingsContext.Provider>
  );
};
