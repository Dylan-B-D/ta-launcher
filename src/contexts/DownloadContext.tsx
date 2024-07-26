import React, { createContext, useState, useContext } from 'react';
import { Packages } from '../interfaces';

interface DownloadContextType {
    queue: string[];
    addToQueue: (packageId: string) => void;
    getQueue: () => string[];
    getTotalItems: () => number;
    getTotalSizeInQueue: (packages: Packages) => number;
}

const DownloadContext = createContext<DownloadContextType>({
    queue: [],
    addToQueue: () => {},
    getQueue: () => [],
    getTotalItems: () => 0,
    getTotalSizeInQueue: () => 0,
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

    const getTotalSizeInQueue = (packages: Packages) => {
        return queue.reduce((total, id) => {
            const pkg = Object.values(packages).find(p => p.package.id === id);
            return total + (pkg ? pkg.package.totalSize || pkg.package.size : 0);
        }, 0);
    };

    return (
        <DownloadContext.Provider value={{ queue, addToQueue, getQueue, getTotalItems, getTotalSizeInQueue }}>
            {children}
        </DownloadContext.Provider>
    );
};

export const useDownload = () => useContext(DownloadContext);

export { DownloadContext };