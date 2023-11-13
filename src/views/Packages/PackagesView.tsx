// PackageView.tsx

import React, { useState, useEffect } from 'react';
import { Container, Loader } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import PackageCard from '../../components/PackageCard/PackageCard';
import classes from './PackagesView.module.css';

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

  const fetchPackages = async () => {
    try {
      // Invoke the command to get the package list
      const packageListResponse = await invoke('fetch_packages');
      const packageList: { packages: PackageData[] } = JSON.parse(packageListResponse as string);

      // Fetch metadata for each package
      const packagesWithMetadata = await Promise.all(packageList.packages.map(async (pkg) => {
        const metadata = await fetchPackageMetadata(`https://tamods-update.s3.ap-southeast-2.amazonaws.com/${pkg.objectKey}`);
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
        {loading ? <Loader /> : packages
            .filter(pkg => isTopLevelPackage(pkg.id))
            .map(pkg => {
                const childrenPackages = dependencyTree[pkg.id]?.map(childId => 
                    packages.find(p => p.id === childId)).filter(Boolean) as PackageData[];
                const hasChildren = childrenPackages && childrenPackages.length > 0;

                return (
                    <div key={pkg.id}>
                        <PackageCard
                            packageData={pkg}
                            onToggleDependencies={() => toggleChildPackageVisibility(pkg.id)}
                            showToggleDependenciesButton={hasChildren}
                        />
                        {expandedPackages.has(pkg.id) && (
                            <div style={{ marginLeft: '60px' }}>
                                {childrenPackages.map(childPkg => (
                                    <PackageCard key={childPkg.id} packageData={childPkg} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
    </Container>
    );
};

export default PackageView;