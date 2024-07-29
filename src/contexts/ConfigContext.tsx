import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadConfig, saveConfig } from '../utils/config';
import { Config } from '../interfaces';

interface ConfigContextType {
    config: Config;
    setConfig: React.Dispatch<React.SetStateAction<Config>>;
    saveConfig: (newConfig: Config) => Promise<void>;
    reloadConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<Config>({
        gamePath: "",
        loginServer: "Community",
        launchMethod: "Non-Steam",
        dllVersion: "Release",
        dpi: 800,
        units: "Metric"
    });

    useEffect(() => {
        loadConfig(setConfig);
    }, []);

    const handleSaveConfig = async (newConfig: Config) => {
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