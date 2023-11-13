// PackageCard.tsx
import React, { useState } from 'react';
import { Card, Text, Group, useMantineTheme, Button } from '@mantine/core';
import { PackageData } from '../../views/Packages/PackagesView';

interface PackageCardProps {
  packageData: PackageData;
  childrenPackages?: PackageData[];
}

const PackageCard: React.FC<PackageCardProps> = ({ packageData, childrenPackages }) => {
    const [showChildren, setShowChildren] = useState(false);
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
      {childrenPackages && childrenPackages.length > 0 && (
        <Button onClick={() => setShowChildren(!showChildren)}>
          {showChildren ? 'Hide Dependencies' : 'Show Dependencies'}
        </Button>
      )}
      {showChildren && (
        <div style={{ marginLeft: '20px' }}>
          {/* Render child packages here */}
        </div>
      )}
    </Card>
  );
};

export default PackageCard;