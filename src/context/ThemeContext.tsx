import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ThemeContextType {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    primaryFontFamily: string;
    setPrimaryColor: (color: string) => void;
    setSecondaryColor: (color: string) => void;
    setTertiaryColor: (color: string) => void;
    setPrimaryFontFamily: (font: string) => void;
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

    const [secondaryColor, setSecondaryColor] = useState<string>(
      () => localStorage.getItem('secondaryColor') || 'mutedAmber'
    );

    const [tertiaryColor, setTertiaryColor] = useState<string>(
      () => localStorage.getItem('tertiaryColor') ||'mutedTeal'
    );

    const [primaryFontFamily, setPrimaryFontFamily] = useState<string>(
        () => localStorage.getItem('primaryFontFamily') || 'Nunito Sans'
    );
    

    useEffect(() => {
      localStorage.setItem('primaryColor', primaryColor);
      localStorage.setItem('secondaryColor', secondaryColor);
      localStorage.setItem('tertiaryColor', tertiaryColor); 
      localStorage.setItem('primaryFontFamily', primaryFontFamily);
    }, [primaryColor, secondaryColor, tertiaryColor, primaryFontFamily]);
  
    return (
        <ThemeContext.Provider value={{ 
            primaryColor, secondaryColor, tertiaryColor,
            primaryFontFamily,
            setPrimaryColor, setSecondaryColor, setTertiaryColor,
            setPrimaryFontFamily
          }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  