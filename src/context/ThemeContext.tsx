import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [primaryColor, setPrimaryColor] = useState<string>(
      () => localStorage.getItem('primaryColor') || 'mutedBlue'
    );
  
    useEffect(() => {
      localStorage.setItem('primaryColor', primaryColor);
    }, [primaryColor]);
  
    return (
      <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  