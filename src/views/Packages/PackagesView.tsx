// PackageView.tsx
import React, { useState, useEffect } from 'react';
import { Card, Text, Group } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';

interface PackageData {
  size: string;
  lastModified: string;
  hash: string;
}

const PackageView: React.FC = () => {
  const [packageData, setPackageData] = useState<PackageData | null>(null);

  useEffect(() => {
    fetchPackageMetadata()
      .then((data) => setPackageData(data))
      .catch((error) => console.error('Failed to fetch package metadata:', error));
  }, []);

  const fetchPackageMetadata = async (): Promise<PackageData> => {
    try {
      // Replace 'your-package-url' with the actual package URL
      const response = await invoke('fetch_package_metadata', { url: 'https://tamods-update.s3.ap-southeast-2.amazonaws.com/packages/tamods-dll.zip' });
      return JSON.parse(response as string);
    } catch (error) {
      console.error('Error fetching package metadata:', error);
      throw error;
    }
  };

  return (
    <Card shadow="sm" padding="lg">
      <Group>
        <Text>Package Name: TAMods.dll</Text>
        {packageData ? (
          <>
            <Text>Size: {packageData.size}</Text>
            <Text>Last Modified: {packageData.lastModified}</Text>
            <Text>Hash: {packageData.hash}</Text>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </Group>
    </Card>
  );
};

export default PackageView;
