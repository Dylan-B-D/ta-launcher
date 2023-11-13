import React, { useState, useEffect } from 'react';
import { Card, Text, Group, Loader } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';

interface PackageMetadata {
  size: string;
  lastModified: string;
  hash: string;
}

interface PackageData {
  id: string;
  objectKey: string;
  metadata: PackageMetadata | null;
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
        return { ...pkg, metadata };
      }));

      setPackages(packagesWithMetadata);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {loading ? (
        <Loader />
      ) : (
        packages.map((pkg) => (
          <Card key={pkg.id} shadow="sm" padding="lg" style={{ marginBottom: '20px' }}>
         
            <Group>
              <Text>Package Name: {pkg.id}</Text>
              {pkg.metadata ? (
                <>
                  <Text>Size: {pkg.metadata.size}</Text>
                  <Text>Last Modified: {pkg.metadata.lastModified}</Text>
                  <Text>Hash: {pkg.metadata.hash}</Text>
                </>
              ) : (
                <Text>Loading metadata...</Text>
              )}
            </Group>
          </Card>
        ))
      )}
    </div>
  );
};

export default PackageView;
