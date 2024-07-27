import React, { createContext, useState, useContext, useEffect } from 'react';
import { PackageNode, Packages } from '../interfaces';
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core';

interface DownloadContextType {
    queue: string[];
    addToQueue: (packageId: string) => void;
    removeFromQueue: (packageId: string) => void;
    getQueue: () => string[];
    getTotalItems: () => number;
    getTotalSizeInQueue: (packages: Packages) => number;
    progress: Record<string, number>;
    packages: Packages;
}

const DownloadContext = createContext<DownloadContextType>({
    queue: [],
    addToQueue: () => {},
    removeFromQueue: () => {},
    getQueue: () => [],
    getTotalItems: () => 0,
    getTotalSizeInQueue: () => 0,
    progress: {},
    packages: {}
});

interface DownloadProviderProps {
    children: React.ReactNode;
    packages: Packages;
}

export const DownloadProvider: React.FC<DownloadProviderProps> = ({ children, packages }) => {
    const [queue, setQueue] = useState<string[]>([]);

    const [progress, setProgress] = useState<Record<string, number>>({});

    useEffect(() => {
        const unlistenProgress = listen('download-progress', (event: any) => {
            const [packageId, downloaded, total] = event.payload;
            // console.log(`${packageId} has downloaded ${downloaded} of ${total} bytes`);
            setProgress(prev => ({...prev, [packageId]: downloaded / total}));
        });

        const unlistenCompleted = listen('download-completed', (event: any) => {
            const [packageId, hash] = event.payload;
            console.log(`${packageId} (${hash}) has finished downloading`);
            removeFromQueue(packageId);
        });

        return () => {
            unlistenProgress.then(f => f());
            unlistenCompleted.then(f => f());
        };
    }, []);

    const addToQueue = (packageId: string) => {
        setQueue(prevQueue => [...prevQueue, packageId]);
        startDownload(packageId);
    };

    const removeFromQueue = (packageId: string) => {
        setQueue(prevQueue => prevQueue.filter(id => id !== packageId));
        setProgress(prev => {
            const { [packageId]: _, ...rest } = prev;
            return rest;
        });
    };

    const findPackageNode = (packageId: string, packages: Packages): PackageNode | null => {
        for (const key in packages) {
            if (key === packageId) {
                return packages[key];
            }
            const foundNode = findPackageNode(packageId, packages[key].dependencies);
            if (foundNode) {
                return foundNode;
            }
        }
        return null;
    };

    const startDownload = async (packageId: string) => {
        const packageNode = findPackageNode(packageId, packages);
        if (packageNode) {
            const packageDetails = packageNode.package;
            try {
                await invoke('download_package', { 
                    packageId, 
                    objectKey: packageDetails.objectKey,
                    totalSize: packageDetails.totalSize,
                    packageHash: packageDetails.hash
                });
            } catch (error) {
                console.error(`Failed to download package ${packageId}:`, error);
                removeFromQueue(packageId);
            }
        } else {
            console.error(`Package ${packageId} not found`);
            removeFromQueue(packageId);
        }
    };

    const getQueue = () => {
        return queue;
    };

    const getTotalItems = () => {
        return queue.length;
    };

    const getTotalSizeInQueue = () => {
        return queue.reduce((total, id) => {
            const pkg = packages[id];
            return total + (pkg ? pkg.package.totalSize || pkg.package.size : 0);
        }, 0);
    }

    return (
        <DownloadContext.Provider value={{ 
            queue, 
            addToQueue, 
            removeFromQueue, 
            getQueue, 
            getTotalItems, 
            getTotalSizeInQueue,
            progress,
            packages
        }}>
            {children}
        </DownloadContext.Provider>
    );
};

export const useDownload = () => useContext(DownloadContext);

// Custom hook to access packages
export const usePackages = () => {
    const context = useContext(DownloadContext);
    if (!context) {
        throw new Error('usePackages must be used within a DownloadProvider');
    }
    return context.packages;
};

export { DownloadContext };