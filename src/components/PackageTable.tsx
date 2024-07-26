import React, { useContext, useEffect, useState } from 'react';
import { Text, Space, Table, Button, Group } from "@mantine/core";
import { Packages } from '../interfaces';
import { formatSize } from '../utils/formatters';
import './componentStyles.css';
import { DownloadContext } from '../contexts/DownloadContext';

interface PackagesTableProps {
    packages: Packages;
}

const PackagesTable: React.FC<PackagesTableProps> = ({ packages }) => {
    const [showCustom, setShowCustom] = useState(false);
    const [pendingPackages, setPendingPackages] = useState<string[]>([]);
    const { addToQueue, getTotalItems, getTotalSizeInQueue } = useContext(DownloadContext);

    const order = [
        'tamods-dll',
        'tamods-stdlib',
        'community-maps',
        'tamods-routesrec',
        'tamods-routeslib',
        'tamods-routesjphard',
        'tamods-dll-beta',
        'tamods-dll-edge'
    ];

    const minimumPackages = ['tamods-dll'];
    const recommendedPackages = ['tamods-dll', 'tamods-stdlib', 'community-maps', 'tamods-routesrec'];

    const sortedPackages = Object.values(packages).sort((a, b) => {
        return order.indexOf(a.package.id) - order.indexOf(b.package.id);
    });

    const calculateTotalSize = (packageIds: string[]) => {
        return packageIds.reduce((total, id) => {
            const pkg = Object.values(packages).find(p => p.package.id === id);
            return total + (pkg ? pkg.package.totalSize || pkg.package.size : 0);
        }, 0);
    };

    const minimumSize = calculateTotalSize(minimumPackages);
    const recommendedSize = calculateTotalSize(recommendedPackages);
    const allSize = calculateTotalSize(order);

    const handleInstall = (packageIds: string[]) => {
        // Function to recursively gather all dependencies
        const gatherDependencies = (id: string, set: Set<string>) => {
            const pkg = Object.values(packages).find(p => p.package.id === id);
            if (pkg && pkg.package.dependencies) {
                pkg.package.dependencies.forEach(depId => {
                    if (!set.has(depId)) {
                        set.add(depId);
                        gatherDependencies(depId, set);  // Recurse into dependencies
                    }
                });
            }
        };        
    
        const allPackagesToInstall = new Set<string>();
    
        // Gather all dependencies for each package
        packageIds.forEach(id => {
            if (!allPackagesToInstall.has(id)) {
                allPackagesToInstall.add(id);
                gatherDependencies(id, allPackagesToInstall);
            }
        });
    
        // Add all gathered packages to the queue
        allPackagesToInstall.forEach(id => {
            if (!pendingPackages.includes(id)) {
                addToQueue(id);
                console.log(`Added ${id} along with its dependencies to download queue`);
            }
        });
    
        // Update state to reflect pending status for all packages
        setPendingPackages(prevPending => [...new Set([...prevPending, ...Array.from(allPackagesToInstall)])]);
    };

    useEffect(() => {
        console.log(`Total items in queue: ${getTotalItems()}`);
        console.log(`Total size in queue: ${formatSize(getTotalSizeInQueue(packages))}`);
    }, [pendingPackages]);

    const handleInstallMinimum = () => {
        handleInstall(minimumPackages);
    };

    const handleInstallRecommended = () => {
        handleInstall(recommendedPackages);
    };

    const handleInstallAll = () => {
        handleInstall(order);
    };

    const handleToggleCustom = () => {
        setShowCustom(!showCustom);
    };

    return (
        <>
            <Text size="xs" c="dimmed">
                <strong>Minimum </strong>(GOTY and TAMODs): TAMods Core Library
            </Text>
            <Text size="xs" c="dimmed">
                <strong>Recommended:</strong> TAMods Core Library, TAMods Standard Library, Community Made Maps, and Recommended GOTY Routes Library
            </Text>

            <Space h="sm" />
            <Group grow preventGrowOverflow={false} wrap="nowrap" gap="xs">
                <Button 
                    variant='light' 
                    color='cyan' 
                    onClick={handleInstallMinimum}
                    disabled={minimumPackages.every(id => pendingPackages.includes(id))}
                >
                    {minimumPackages.every(id => pendingPackages.includes(id)) ? 'Pending' : `Minimum (${formatSize(minimumSize)})`}
                </Button>
                <Button 
                    variant='light' 
                    color='cyan' 
                    onClick={handleInstallRecommended}
                    disabled={recommendedPackages.every(id => pendingPackages.includes(id))}
                >
                    {recommendedPackages.every(id => pendingPackages.includes(id)) ? 'Pending' : `Recommended (${formatSize(recommendedSize)})`}
                </Button>
                <Button 
                    variant='light' 
                    color='cyan' 
                    onClick={handleInstallAll}
                    disabled={order.every(id => pendingPackages.includes(id))}
                >
                    {order.every(id => pendingPackages.includes(id)) ? 'Pending' : `All (${formatSize(allSize)})`}
                </Button>
                <Button w={120} variant='light' color='cyan' onClick={handleToggleCustom}>
                    {showCustom ? 'Hide Advanced' : 'Show Advanced'}
                </Button>
            </Group>

            <Space h="sm" />

            {showCustom && (
                <>
                    <Table withTableBorder withColumnBorders striped highlightOnHover verticalSpacing="2px" fz="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Size</Table.Th>
                                <Table.Th>Last Modified</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {sortedPackages.map(({ package: pkg }) => (
                                <Table.Tr key={pkg.id}>
                                    <Table.Td>{pkg.displayName}</Table.Td>
                                    <Table.Td>{pkg.description}</Table.Td>
                                    <Table.Td>{formatSize(pkg.totalSize || pkg.size)}</Table.Td>
                                    <Table.Td>{new Date(pkg.lastModified).toLocaleDateString()}</Table.Td>
                                    <Table.Td style={{ padding: 0 }}>
                                        <Button
                                            size="xs"
                                            radius="0"
                                            variant="light"
                                            color="cyan"
                                            className="full-size-button"
                                            onClick={() => handleInstall([pkg.id])}
                                            disabled={pendingPackages.includes(pkg.id)}
                                        >
                                            {pendingPackages.includes(pkg.id) ? 'Pending' : 'Install'}
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </>
            )}
        </>
    );
};

export default PackagesTable;