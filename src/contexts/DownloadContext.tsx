import React, { createContext, useState, useContext } from 'react';

interface DownloadContextType {
    queue: string[];
    addToQueue: (packageId: string) => void;
    getQueue: () => string[];
    getTotalItems: () => number;
}

const DownloadContext = createContext<DownloadContextType>({
    queue: [],
    addToQueue: () => {},
    getQueue: () => [],
    getTotalItems: () => 0,
});

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [queue, setQueue] = useState<string[]>([]);

    const addToQueue = (packageId: string) => {
        setQueue((prevQueue) => [...prevQueue, packageId]);
        // start the download process
        // For example: startDownload(packageId);
    };

    const getQueue = () => {
        return queue;
    };

    const getTotalItems = () => {
        return queue.length;
    };

    return (
        <DownloadContext.Provider value={{ queue, addToQueue, getQueue, getTotalItems }}>
            {children}
        </DownloadContext.Provider>
    );
};

export const useDownload = () => useContext(DownloadContext);

export { DownloadContext };