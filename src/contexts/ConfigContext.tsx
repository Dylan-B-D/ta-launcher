import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadConfig, saveConfig } from '../utils/config';

interface ConfigContextType {
    config: Record<string, any>;
    setConfig: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    saveConfig: (newConfig: Record<string, any>) => Promise<void>;
    reloadConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<Record<string, any>>({});

    useEffect(() => {
        loadConfig(setConfig);
    }, []);

    const handleSaveConfig = async (newConfig: Record<string, any>) => {
        await saveConfig(newConfig);
        setConfig(newConfig);
    };

    const reloadConfig = async () => {
        await loadConfig(setConfig);
    };


    return (
        <ConfigContext.Provider value={{ 
                config, 
                setConfig, 
                saveConfig: handleSaveConfig, 
                reloadConfig 
            }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};