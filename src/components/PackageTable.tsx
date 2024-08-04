import { useEffect, useState } from 'react';
import { Text, Space, Table, Button, Group, Progress, Loader } from "@mantine/core";
import { formatSize } from '../utils/formatters';
import { useDownloadContext, usePackages } from '../contexts/DownloadContext';
import NotificationPopup from './NotificationPopup';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useConfig } from '../contexts/ConfigContext';

const PackagesTable = () => {
    const [pendingPackages, setPendingPackages] = useState<string[]>([]);
    const [showNotification, setShowNotification] = useState(false);
    const { addToQueue, getTotalSize, getOverallProgress, getQueue, getCompletedPackages } = useDownloadContext();
    const totalSize = getTotalSize();
    const overallProgress = getOverallProgress();
    const progressPercentage = (overallProgress / totalSize) * 100;
    const packages = usePackages();
    const queue = getQueue();
    const completedPackages = getCompletedPackages();
    const { config } = useConfig();

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
    }).map(pkg => {
        if (pkg.package.id === 'tamods-routesrec') {
            return {
                ...pkg,
                package: {
                    ...pkg.package,
                    description: `${pkg.package.description} And Nerve's routes.`
                }
            };
        }
        return pkg;
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

        const isDownloading = (id: string): boolean => {
            if (queue.includes(id)) return true;
            const pkg = Object.values(packages).find(p => p.package.id === id);
            if (pkg && pkg.package.dependencies) {
                return pkg.package.dependencies.some(depId => isDownloading(depId));
            }
            return false;
        };

        if (isCompleted(pkgId)) return 'completed';
        if (isDownloading(pkgId)) return 'downloading';
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

    const isButtonDisabled = (packageIds: string[]) => {
        if (config.gamePath === '') {
            return packageIds.includes('community-maps');
        }
        return packageIds.every(id => pendingPackages.includes(id) || queue.includes(id) || completedPackages.has(id));
    };

    useEffect(() => {
        if (config.gamePath === '') {
            setShowNotification(true);
        }
    }, [config.gamePath]);

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

            <Space h="8px" />
            <Group grow preventGrowOverflow={false} wrap="nowrap" gap="xs">
                <Button
                    variant='light'
                    size='18px'
                    style={{ fontSize: '0.8em', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}
                    color='cyan'
                    onClick={handleInstallMinimum}
                    disabled={isButtonDisabled(minimumPackages)}
                >
                    Minimum {formatSize(minimumSize)}
                </Button>
                <Button
                    variant='light'
                    color='cyan'
                    onClick={handleInstallStandard}
                    disabled={isButtonDisabled(standardPackages)}
                    size='18px'
                    style={{ fontSize: '0.8em', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}
                >
                    Standard {formatSize(standardSize)}
                </Button>
                <Button
                    variant='light'
                    color='cyan'
                    onClick={handleInstallRecommended}
                    disabled={isButtonDisabled(recommendedPackages)}
                    size='18px'
                    style={{ fontSize: '0.8em', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}
                >
                    Recommended {formatSize(recommendedSize)}
                </Button>
                <Button
                    variant='light'
                    color='cyan'
                    onClick={handleInstallAll}
                    disabled={isButtonDisabled(order)}
                    size='18px'
                    style={{ fontSize: '0.8em', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}
                >
                    All {formatSize(allSize)}
                </Button>
            </Group>

            <Space h="8px" />

            <Table verticalSpacing="2px" fz="xs" style={{ borderRadius: '8px' }}>
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
                            <Table.Td style={{ color: getStatus(pkg.id) === 'completed' ? 'lightgreen' : 'inherit', fontWeight: getStatus(pkg.id) === 'completed' ? 'bold' : 'normal', textShadow: getStatus(pkg.id) === 'completed' ? '1px 1px 10px rgba(255,255,255,0.2), 1px 1px 1px rgba(255,255,255,0.0)' : 'none' }}>
                                {pkg.displayName}
                            </Table.Td>
                            <Table.Td>{pkg.description}</Table.Td>
                            <Table.Td>{formatSize(pkg.totalSize || pkg.size)}</Table.Td>
                            <Table.Td>{new Date(pkg.lastModified).toLocaleDateString()}</Table.Td>
                            <Table.Td style={{ padding: 0, textAlign: 'center' }}>
                                {getStatus(pkg.id) === 'completed' ? (
                                    <Text c='teal' size='sm' fw='bold' style={{ color: 'green' }}>✔</Text>
                                ) : (
                                    <Button
                                        size="xs"
                                        radius="0"
                                        variant="light"
                                        color={getStatus(pkg.id) === 'downloading' ? 'cyan' : 'cyan'}
                                        className="full-size-button"
                                        onClick={() => handleInstall([pkg.id])}
                                        disabled={getStatus(pkg.id) !== 'install' || (config.gamePath === '' && pkg.id === 'community-maps')}
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
                <div style={{ position: 'relative', width: '100%', marginTop: 4 }}>
                    <Text style={{ margin: '0', fontSize: '0.9em' }}>Progress: {formatSize(overallProgress)} / Total: {formatSize(totalSize)}</Text>
                    <Progress size='sm' color='teal' animated value={progressPercentage} mt="0" />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8em' }}>
                        {`${Math.round(progressPercentage)}%`}
                    </div>
                </div>
            )}
            <NotificationPopup
                visible={showNotification}
                message="Some packages are not available because the game path is not set."
                title="Warning"
                color="yellow"
                onClose={() => setShowNotification(false)}
                icon={<IconAlertTriangle />}
            />
        </>
    );
};

export default PackagesTable;