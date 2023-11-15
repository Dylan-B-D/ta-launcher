// PackageCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Text, Badge, useMantineTheme, Button, Progress } from '@mantine/core';
import { PackageData } from '../../views/Packages/PackagesView';
import { PiCaretRightBold, PiCaretUpBold } from'react-icons/pi';
import { BiSolidDownload } from 'react-icons/bi';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';


interface PackageCardProps {
  packageData: PackageData;
  onToggleDependencies?: () => void;
  showToggleDependenciesButton?: boolean;
  areChildrenVisible?: boolean;
  totalSize?: number;
  childrenCount?: number;
}

interface DownloadProgress {
  download_id: number;
  filesize: number;
  transferred: number;
  transfer_rate: number;
  percentage: number;
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
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);


  // Update local state when the prop changes
  useEffect(() => {
    setIsExpanded(areChildrenVisible);
  }, [areChildrenVisible]);

  useEffect(() => {
    // Function to handle download progress
    const handleDownloadProgress = (event: { payload: DownloadProgress; }) => {
      const progressData: DownloadProgress = event.payload;
      setDownloadProgress(progressData);
    };
  
    // Function to handle download completion
    const handleDownloadComplete = () => {
      console.log("Download complete");
      // You can reset progress or perform other actions
      setDownloadProgress(null);
    };
  
    // Listening to download progress
    const unsubscribeProgress = listen('DOWNLOAD_PROGRESS', handleDownloadProgress);
  
    // Listening to download completion
    const unsubscribeComplete = listen('DOWNLOAD_FINISHED', handleDownloadComplete);
  
    // Clean up the listeners when the component is unmounted
    return () => {
      unsubscribeProgress.then((fn) => fn());
      unsubscribeComplete.then((fn) => fn());
    };
  }, []);

  const handleToggleDependencies = () => {
    setIsExpanded(!isExpanded);
    if (onToggleDependencies) {
      onToggleDependencies();
    }
  };

  // Gradient background for the package name
  const gradient = `linear-gradient(135deg, ${theme.colors.mutedBlue[3]} 0%, ${theme.colors.mutedBlue[0]} 100%)`;

  const handleInstallClick = () => {
    // Convert filesize to a number. Use optional chaining and nullish coalescing.
    const filesize = parseInt(packageData.metadata?.size ?? "0");
  
    if (isNaN(filesize) || filesize === 0) {
      console.error('Invalid or missing size information, cannot proceed with download');
      return; // Optionally, handle this case appropriately in the UI
    }
  
    invoke('download_package', { packageId: packageData.id, filesize })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('Download error:', error);
      });
  
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
        {downloadProgress && (
          <div>
            <p>Downloading: {downloadProgress.percentage.toFixed(2)}%</p>
            <p>Rate: {downloadProgress.transfer_rate.toFixed(2)} bytes/sec</p>
          </div>
        )}
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