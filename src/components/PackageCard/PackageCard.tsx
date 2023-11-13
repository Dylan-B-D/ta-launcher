// PackageCard.tsx
import React from 'react';
import { Card, Text, Group, useMantineTheme, Button } from '@mantine/core';
import { PackageData } from '../../views/Packages/PackagesView';

interface PackageCardProps {
    packageData: PackageData;
    onToggleDependencies?: () => void;
    showToggleDependenciesButton?: boolean;
    areChildrenVisible?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({ packageData, onToggleDependencies, showToggleDependenciesButton, areChildrenVisible }) => {
    const theme = useMantineTheme();

    return (
        <Card style={{ width: '50%', backgroundColor: theme.colors.mutedBlue[3], marginBottom: '16px' }}>
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
            {showToggleDependenciesButton && (
                <Button onClick={onToggleDependencies}>
                    {areChildrenVisible ? 'Hide Dependencies' : 'Show Dependencies'}
                </Button>
            )}
        </Card>
    );
};

export default PackageCard;