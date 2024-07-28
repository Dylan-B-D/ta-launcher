import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { PackageNode, Packages } from '../interfaces';
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core';
import { loadDownloadedPackages, saveDownloadedPackages } from '../utils/config';

interface DownloadContextType {
    queue: string[];
    addToQueue: (packageId: string) => void;
    removeFromQueue: (packageId: string) => void;
    getQueue: () => string[];
    getTotalItems: () => number;
    getTotalSizeInQueue: (packages: Packages) => number;
    packages: Packages;
    getTotalSize: () => number;
    getOverallProgress: () => number;
    getCompletedPackages: () => Map<string, string>;
    packagesToUpdate: string[];
}

const DownloadContext = createContext<DownloadContextType>({
    queue: [],
    addToQueue: () => {},
    removeFromQueue: () => {},
    getQueue: () => [],
    getTotalItems: () => 0,
    getTotalSizeInQueue: () => 0,
    packages: {},
    getTotalSize: () => 0,
    getOverallProgress: () => 0,
    getCompletedPackages: () => new Map(),
    packagesToUpdate: []
});

interface DownloadProviderProps {
    children: React.ReactNode;
    packages: Packages;
}

export const DownloadProvider: React.FC<DownloadProviderProps> = ({ children, packages }) => {
    const [queue, setQueue] = useState<string[]>([]);
    const [totalSize, setTotalSize] = useState<number>(0);
    const [completedPackages, setCompletedPackages] = useState<Map<string, string>>(new Map());
    const progressMapRef = useRef<Map<string, number>>(new Map());
    const [packagesToUpdate, setPackagesToUpdate] = useState<string[]>([]);

    const calculateOverallProgress = useCallback(() => {
        return Array.from(progressMapRef.current.values()).reduce((sum, value) => sum + value, 0);
    }, []);

    const checkPackageHashes = (savedPackages: Map<string, string>, currentPackages: Packages, toUpdate: Set<string> = new Set()) => {
        for (const [packageId, savedHash] of savedPackages) {
            const packageNode = findPackageNode(packageId, currentPackages);
            if (packageNode && packageNode.package.hash !== savedHash) {
                toUpdate.add(packageId);
            }
            
            // Check dependencies
            if (packageNode) {
                checkPackageHashes(savedPackages, packageNode.dependencies, toUpdate);
            }
        }
        return toUpdate;
    };

    useEffect(() => {

        // Load downloaded packages when the component mounts
        loadDownloadedPackages().then(savedPackages => {
            setCompletedPackages(savedPackages);
            
            // Check hashes and create list of packages to update
            const packagesToUpdate = checkPackageHashes(savedPackages, packages);
            setPackagesToUpdate(Array.from(packagesToUpdate));
            
            // Log packages that need updating
            if (packagesToUpdate.size > 0) {
                console.log('Packages that need updating:', Array.from(packagesToUpdate));
            } else {
                console.log('No packages need updating');
            }
        });

        const unlistenProgress = listen('download-progress', (event: any) => {
            const [packageId, downloaded] = event.payload;
            progressMapRef.current.set(packageId, downloaded);
            // Force a re-render
            setQueue(prev => [...prev]);
        });

        const unlistenCompleted = listen('download-completed', async (event: any) => {
            const [packageId, hash] = event.payload;
            setCompletedPackages(prev => {
                const newMap = new Map(prev).set(packageId, hash);
                saveDownloadedPackages(newMap);
                return newMap;
            });
            const newQueue = await removeFromQueue(packageId);

            console.log('Download completed:', event.payload);
            console.log('New Queue:', newQueue);
            console.log('New Queue length:', newQueue.length);

            if (newQueue.length === 0) {
                setTotalSize(0);
                progressMapRef.current.clear();
                // Force a re-render
                setQueue([]);
            }
        });

        return () => {
            unlistenProgress.then(f => f());
            unlistenCompleted.then(f => f());
        };
    }, [packages]);

    const addToQueue = (packageId: string) => {
        setQueue(prevQueue => [...prevQueue, packageId]);
        const packageNode = findPackageNode(packageId, packages);
        if (packageNode && packageNode.package.totalSize) {
            setTotalSize(prev => prev + packageNode.package.totalSize);
        }
        startDownload(packageId);
    };

    const removeFromQueue = (packageId: string) => {
        return new Promise<string[]>((resolve) => {
            setQueue(prevQueue => {
                const newQueue = prevQueue.filter(id => id !== packageId);
                resolve(newQueue);
                return newQueue;
            });
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
            packages,
            getTotalSize: () => totalSize,
            getOverallProgress: calculateOverallProgress,
            getCompletedPackages: () => completedPackages,
            packagesToUpdate
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