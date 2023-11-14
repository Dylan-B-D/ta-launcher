// PackageCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Text, Badge, useMantineTheme, Button } from '@mantine/core';
import { PackageData } from '../../views/Packages/PackagesView';
import { PiCaretRightBold, PiCaretUpBold } from'react-icons/pi';
import { BiSolidDownload } from 'react-icons/bi';

interface PackageCardProps {
  packageData: PackageData;
  onToggleDependencies?: () => void;
  showToggleDependenciesButton?: boolean;
  areChildrenVisible?: boolean;
  totalSize?: number;
  childrenCount?: number;
}

function formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
  
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  

const PackageCard: React.FC<PackageCardProps> = ({ packageData, onToggleDependencies, showToggleDependenciesButton, areChildrenVisible, totalSize, childrenCount }) => {
  const theme = useMantineTheme();

  const [isExpanded, setIsExpanded] = useState(areChildrenVisible);

  // Update local state when the prop changes
  useEffect(() => {
    setIsExpanded(areChildrenVisible);
  }, [areChildrenVisible]);

  const handleToggleDependencies = () => {
    setIsExpanded(!isExpanded);
    if (onToggleDependencies) {
      onToggleDependencies();
    }
  };

  // Gradient background for the package name
  const gradient = `linear-gradient(135deg, ${theme.colors.mutedBlue[3]} 0%, ${theme.colors.mutedBlue[0]} 100%)`;

  const handleInstallClick = () => {
    // Placeholder for install logic
    console.log("Install clicked for package:", packageData.id);
  };
  

  return (
    <Card style={{ width: '18rem', backgroundColor: theme.colors.darkGray[2], marginBottom: '16px', overflow: 'hidden' }}>
      <Card.Section>
        <div style={{ background: gradient, padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.lightGray[5], fontWeight: 'bold' }}>{packageData.displayName}</Text>
          <Badge color="red" variant="light">Not Installed</Badge>
        </div>
      </Card.Section>

      <div style={{ padding: '10px 15px' }}>
        <Text style={{ color: theme.colors.lightGray[9], opacity: 0.8, marginBottom: '10px' }}>{packageData.description}</Text>
        <hr style={{ borderColor: theme.colors.mutedBlue[3] }} />

        {packageData.metadata ? (
          <>
            <Text style={{ color: theme.colors.lightGray[9], opacity: 0.5 }}>
                Size: {formatBytes(packageData.metadata.size)}
            </Text>
            {/* Display Total Size if available */}
            {typeof totalSize === 'number' && (
              <Text style={{ color: theme.colors.lightGray[9], opacity: 0.5 }}>
                Total Size: {formatBytes(totalSize)}
              </Text>
            )}
            <Text style={{ color: theme.colors.lightGray[9], opacity: 0.5 }}>
                Last Modified: {formatDate(packageData.metadata.lastModified)}
            </Text>
          </>
        ) : (
          <Text>Loading metadata...</Text>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px' }}>
        

        <Button 
          rightSection={<BiSolidDownload size={14} />}
          onClick={handleInstallClick}
          style={{ backgroundColor: theme.colors.mutedBlue[3], 
            color: theme.colors.lightGray[5],
            paddingLeft: '4px',
            paddingRight: '4px'
           }}
        >
          Install
        </Button>
        {showToggleDependenciesButton && (
        <Button 
          rightSection={isExpanded ? <PiCaretUpBold size={14} /> : <PiCaretRightBold size={14} />}
          onClick={handleToggleDependencies} 
          style={{ backgroundColor: theme.colors.mutedBlue[3], 
            color: theme.colors.lightGray[5],
            paddingLeft: '4px',
            paddingRight: '4px'
           }}
        >
          {isExpanded ? `Dependencies (${childrenCount})` : `Dependencies (${childrenCount})`}
        </Button>
      )}
      </div>
    </Card>
  );
};

export default PackageCard;