// HeaderComponent.tsx
import React, { useEffect, useState } from 'react';
import { AppShell, Badge, Progress, useMantineTheme } from '@mantine/core';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

interface DownloadProgress {
    download_id: number;
    filesize: number;
    transferred: number;
    transfer_rate: number;
    percentage: number;
  }

  function formatSpeed(bytesPerSecond: number, decimals = 2) {
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
  
    if (bytesPerSecond === 0) return '0 Bytes/s';
  
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const HeaderComponent: React.FC = () => {
    const theme = useMantineTheme();
    const [playerCounts, setPlayerCounts] = useState({ PUG: 0, Community: 0 });
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

    useEffect(() => {
        invoke('fetch_players_online')
          .then((response) => {
            if (typeof response === 'string') {
              const data = JSON.parse(response);
              setPlayerCounts({ PUG: data.PUG, Community: data.Community });
            } else {
              console.error('Response is not a string:', response);
            }
          })
          .catch((error) => console.error('Error fetching players:', error));
    
      }, []);
    
      useEffect(() => {
        // Function to handle download progress
        const handleDownloadProgress = (event: { payload: any; }) => {
          const progressData = event.payload;
          setDownloadProgress(progressData);
        };
      
        // Function to handle download completion
        const handleDownloadComplete = () => {
          console.log("Download complete");
          setDownloadProgress(null); // Reset progress on completion
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

  return (
    <AppShell.Header
      styles={(theme) => ({
        header: {
          backgroundColor: theme.colors.darkGray[3],
          borderBottomColor: theme.colors.darkGray[0],
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
        },
      })}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1"></div> {/* Invisible spacer */}

        {/* Centered download progress and text */}
        {downloadProgress && (
  <div className="flex items-center justify-center flex-grow" style={{ width: '100%', maxWidth: '400px' }}>
    <div style={{ width: '200px' }}> {/* Fixed width for the progress bar */}
      <Progress
        value={downloadProgress.percentage}
        color="green"
        animated
        size="xs"
        style={{ backgroundColor: 'black' }}
      />
    </div>
    <div style={{ width: '150px', marginLeft: '15px' }}> {/* Fixed width for the text */}
      <span style={{ color: theme.colors.lightGray[9], whiteSpace: 'nowrap' }}>
        {downloadProgress.percentage.toFixed(2)}% at {formatSpeed(downloadProgress.transfer_rate)}
      </span>
    </div>
  </div>
)}


        <div className="flex items-center pr-4">
          <Badge color="mutedBlue" variant="filled" style={{
            marginLeft: '10px', marginTop: '5px', color: theme.colors?.darkGray?.[3] || '#B0B0B0'
          }}>
            Community: {playerCounts.Community}
          </Badge>
          <Badge color="mutedBlue" variant="filled" style={{
            marginLeft: '10px', marginTop: '5px', color: theme.colors?.darkGray?.[3] || '#B0B0B0' 
          }}>
            PUG: {playerCounts.PUG}
          </Badge>
        </div>
      </div>
    </AppShell.Header>
  );
};

export default HeaderComponent;
