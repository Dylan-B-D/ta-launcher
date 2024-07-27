import { useContext, useState } from 'react';
import { Text, Space, Table, Button, Group, Progress, Loader } from "@mantine/core";
import { formatSize } from '../utils/formatters';
import './componentStyles.css';
import { DownloadContext, usePackages } from '../contexts/DownloadContext';

const PackagesTable = () => {
    const [pendingPackages, setPendingPackages] = useState<string[]>([]);
    const { addToQueue, getTotalSize, getOverallProgress, getQueue, getCompletedPackages } = useContext(DownloadContext);
    const totalSize = getTotalSize();
    const overallProgress = getOverallProgress();
    const progressPercentage = (overallProgress / totalSize) * 100;
    const packages = usePackages();
    const queue = getQueue();
    const completedPackages = getCompletedPackages();

    // Order of packages to display in the table (other packages are shown above the ordered ones)
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
    const standardPackages = ['tamods-dll', 'tamods-stdlib', 'tamods-routesrec'];
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
    const standardSize = calculateTotalSize(standardPackages);
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

    const getStatus = (pkgId: string) => {
        const isCompleted = (id: string): boolean => {
            if (!completedPackages.has(id)) return false;
            const pkg = Object.values(packages).find(p => p.package.id === id);
            if (pkg && pkg.package.dependencies) {
                return pkg.package.dependencies.every(depId => isCompleted(depId));
            }
            return true;
        };

        if (isCompleted(pkgId)) return 'completed';
        if (queue.includes(pkgId)) return 'downloading';
        if (pendingPackages.includes(pkgId)) return 'pending';
        return 'install';
    };

    const handleInstallMinimum = () => {
        handleInstall(minimumPackages);
    };

    const handleInstallStandard = () => {
        handleInstall(standardPackages);
    };

    const handleInstallRecommended = () => {
        handleInstall(recommendedPackages);
    };

    const handleInstallAll = () => {
        handleInstall(order);
    };

    return (
        <>
            <Text size="xs" c="dimmed">
                <strong>Minimum </strong>(GOTY and TAMODs): TAMods Core Library
            </Text>
            <Text size="xs" c="dimmed">
                <strong>Standard:</strong> TAMods Core Library, TAMods Standard Library, and Recommended GOTY Routes Library
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
                    onClick={handleInstallStandard}
                    disabled={standardPackages.every(id => pendingPackages.includes(id))}
                >
                    {standardPackages.every(id => pendingPackages.includes(id)) ? 'Pending' : `Standard (${formatSize(standardSize)})`}
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
            </Group>

            <Space h="sm" />

            <Table withTableBorder withColumnBorders striped highlightOnHover verticalSpacing="2px" fz="xs">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Size</Table.Th>
                        <Table.Th>Modified</Table.Th>
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
                            <Table.Td style={{ padding: 0, textAlign: 'center' }}>
                                {getStatus(pkg.id) === 'completed' ? (
                                    <Text c='teal' fw='bold' style={{ color: 'green' }}>✔</Text>
                                ) : (
                                    <Button
                                        size="xs"
                                        radius="0"
                                        variant="light"
                                        color={getStatus(pkg.id) === 'downloading' ? 'cyan' : 'cyan'}
                                        className="full-size-button"
                                        onClick={() => handleInstall([pkg.id])}
                                        disabled={getStatus(pkg.id) !== 'install'}
                                    >
                                        {getStatus(pkg.id) === 'downloading' ? (
                                            <Loader color="cyan" size="xs" type="dots" />
                                        ) : getStatus(pkg.id) === 'pending' ? 'Pending' : 'Install'}
                                    </Button>
                                )}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {totalSize > 0 && (
                <div style={{ position: 'relative', width: '100%' }}>
                    <Text>Progress: {formatSize(overallProgress)} / Total: {formatSize(totalSize)}</Text>
                    <Progress size='md' color='teal' animated value={progressPercentage} mt="md" />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        {`${Math.round(progressPercentage)}%`}
                    </div>
                </div>
            )}
        </>
    );
};

export default PackagesTable;