// PackageCard.tsx
import React from 'react';
import { Card, Text, Group, useMantineTheme } from '@mantine/core';
import { PackageData } from '../../views/Packages/PackagesView';

interface PackageCardProps {
  packageData: PackageData;
}

const PackageCard: React.FC<PackageCardProps> = ({ packageData }) => {
    const theme = useMantineTheme();
  return (
    <Card key={packageData.id}  style={{ backgroundColor: theme.colors.mutedBlue[3], marginBottom: '16px' }}>
      <Group>
        <Text>Package Name: {packageData.displayName}</Text>
        {packageData.metadata ? (
          <>
            <Text>Size: {packageData.metadata.size}</Text>
            <Text>Last Modified: {packageData.metadata.lastModified}</Text>
            <Text>Hash: {packageData.metadata.hash}</Text>
          </>
        ) : (
          <Text>Loading metadata...</Text>
        )}
      </Group>
    </Card>
  );
};

export default PackageCard;
