// PackageView.tsx

import React, { useState, useEffect } from 'react';
import { Container, Loader } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import PackageCard from '../components/PackageCard';

interface PackageMetadata {
  size: string;
  lastModified: string;
  hash: string;
}

export interface PackageData {
  id: string;
  displayName: string;
  objectKey: string;
  description: string;
  metadata: PackageMetadata | null;
}


const PackageView: React.FC = () => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [dependencyTree, setDependencyTree] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());
  const [rootPackageTotalSizes, setRootPackageTotalSizes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchPackages().then(() => {
      fetchDependencyTree().then(() => setLoading(false));
    });
  }, []);

  const fetchPackageMetadata = async (url: string): Promise<PackageMetadata> => {
    const response = await invoke('fetch_package_metadata', { url });
    return JSON.parse(response as string);
  };

  const fetchDependencyTree = async () => {
    try {
      const response = await invoke('fetch_dependency_tree');
      const tree: Record<string, string[]> = JSON.parse(response as string);
      setDependencyTree(tree);
    } catch (error) {
      console.error('Error fetching dependency tree:', error);
    }
  };

  // New function to get root packages with their children count
  const getChildrenCountForRootPackage = (packageId: string): number => {
    if (isTopLevelPackage(packageId)) {
      const children = dependencyTree[packageId];
      return children ? children.length : 0;
    }
    return 0;
  };

  // Function to calculate the total size of a package including its dependencies
  const calculateTotalSizeForRootPackage = (packageId: string): number => {
    if (!isTopLevelPackage(packageId)) {
      console.warn(`Package '${packageId}' is not a root package.`);
      return 0;
    }

    const calculateSizeRecursive = (id: string): number => {
      const currentPackage = packages.find(pkg => pkg.id === id);
      const size = currentPackage && currentPackage.metadata ? parseInt(currentPackage.metadata.size, 10) : 0;
      const childSizes = dependencyTree[id] ? dependencyTree[id].map(calculateSizeRecursive).reduce((a, b) => a + b, 0) : 0;
      return size + childSizes;
    };

    return calculateSizeRecursive(packageId);
  };

  useEffect(() => {
    if (!loading) {
      // Calculate and store total sizes for root packages
      const calculatedTotalSizes = packages.filter(pkg => isTopLevelPackage(pkg.id))
        .reduce((acc, pkg) => {
          acc[pkg.id] = calculateTotalSizeForRootPackage(pkg.id);
          return acc;
        }, {} as Record<string, number>);

      setRootPackageTotalSizes(calculatedTotalSizes);
    }
  }, [loading, dependencyTree, packages]);

  const fetchPackages = async () => {
    try {
      // Invoke the command to get the package list
      const packageListResponse = await invoke('fetch_packages');
      const packageList: { packages: PackageData[] } = JSON.parse(packageListResponse as string);

      // Fetch metadata for each package
      const packagesWithMetadata = await Promise.all(packageList.packages.map(async (pkg) => {
        const metadata = await fetchPackageMetadata(`https://client.update.tamods.org/${pkg.objectKey}`);
        return { ...pkg, metadata };
      }));
      setPackages(packagesWithMetadata);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };


  const toggleChildPackageVisibility = (packageId: string) => {
    setExpandedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };


  const isTopLevelPackage = (packageId: string): boolean => {
    return !Object.values(dependencyTree).some(deps => deps.includes(packageId));
  };

  return (
    <Container fluid h={100}>
      {loading ? <Loader /> : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 0fr))',
          gap: '16px',
        }}>
          {packages.filter(pkg => isTopLevelPackage(pkg.id)).map(pkg => {
            const childrenPackages = dependencyTree[pkg.id]?.map(childId =>
              packages.find(p => p.id === childId)).filter(Boolean) as PackageData[];
            const hasChildren = childrenPackages && childrenPackages.length > 0;
            const totalSize = rootPackageTotalSizes[pkg.id];
            const childrenCount = getChildrenCountForRootPackage(pkg.id);

            return (
              <div key={pkg.id}>
                <PackageCard
                  packageData={pkg}
                  onToggleDependencies={() => toggleChildPackageVisibility(pkg.id)}
                  showToggleDependenciesButton={hasChildren}
                  totalSize={totalSize}
                  childrenCount={childrenCount}
                />
                {expandedPackages.has(pkg.id) && (
                  <div style={{ borderColor: 'rgba(255,255,255,0.5)', borderStyle: 'solid', borderWidth: '0 0 0 2px ', borderRadius: '6px' }}>
                    {childrenPackages.map(childPkg => (
                      <PackageCard key={childPkg.id} packageData={childPkg}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );

};

export default PackageView;