import React, { createContext, useState, useContext } from 'react';

interface DownloadContextType {
    queue: string[];
    addToQueue: (packageId: string) => void;
}

const DownloadContext = createContext<DownloadContextType>({
    queue: [],
    addToQueue: () => {},
});

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [queue, setQueue] = useState<string[]>([]);

    const addToQueue = (packageId: string) => {
        setQueue((prevQueue) => [...prevQueue, packageId]);
        // start the download process
        // For example: startDownload(packageId);
    };

    return (
        <DownloadContext.Provider value={{ queue, addToQueue }}>
            {children}
        </DownloadContext.Provider>
    );
};

export const useDownload = () => useContext(DownloadContext);

export { DownloadContext };