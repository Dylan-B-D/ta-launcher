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
    metadata: PackageMetadata | null;
    description: string;
  }
  

const PackageView: React.FC = () => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPackages().then(() => setLoading(false));
  }, []);

  const fetchPackageMetadata = async (url: string): Promise<PackageMetadata> => {
    const response = await invoke('fetch_package_metadata', { url });
    return JSON.parse(response as string);
  };

  const fetchPackages = async () => {
    try {
      // Invoke the command to get the package list
      const packageListResponse = await invoke('fetch_packages');
      const packageList: { packages: PackageData[] } = JSON.parse(packageListResponse as string);

      // Fetch metadata for each package
      const packagesWithMetadata = await Promise.all(packageList.packages.map(async (pkg) => {
        const metadata = await fetchPackageMetadata(`https://tamods-update.s3.ap-southeast-2.amazonaws.com/${pkg.objectKey}`);
        return { ...pkg, metadata, description: pkg.description }; // Ensure the description is included here
      }));

      setPackages(packagesWithMetadata);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  return (
    <Container fluid h={100} >
      {loading ? <Loader /> : packages.map(pkg => <PackageCard key={pkg.id} packageData={pkg} />)}
    </Container>
  );
};

export default PackageView;
