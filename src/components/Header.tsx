// HeaderComponent.tsx
import React, { useEffect, useState } from 'react';
import { AppShell, Badge, Code, Progress, useMantineTheme } from '@mantine/core';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { formatSpeed } from '../utils.ts';

interface DownloadProgress {
  download_id: number;
  filesize: number;
  transferred: number;
  transfer_rate: number;
  percentage: number;
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


    const unsubscribeProgress = listen('DOWNLOAD_PROGRESS', handleDownloadProgress);


    const unsubscribeComplete = listen('DOWNLOAD_FINISHED', handleDownloadComplete);

    
    return () => {
      unsubscribeProgress.then((fn) => fn());
      unsubscribeComplete.then((fn) => fn());
    };
  }, []);

  return (
    <AppShell.Header
      styles={() => ({
        header: {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
        },
      })}
    >
      {/* Left-aligned badges */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Badge color="mutedBlue" variant="filled" style={{
          marginLeft: '10px', color: theme.colors?.darkGray?.[3] || '#B0B0B0'
        }}>
          Community: {playerCounts.Community}
        </Badge>
        <Badge color="mutedBlue" variant="filled" style={{
          marginLeft: '10px', color: theme.colors?.darkGray?.[3] || '#B0B0B0'
        }}>
          PUG: {playerCounts.PUG}
        </Badge>
      </div>
  
      {/* Centered download progress and text */}
      {downloadProgress && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Progress
            value={downloadProgress.percentage}
            color="green"
            animated
            size="xs"
            style={{ width: '200px', backgroundColor: 'black' }} // Fixed width for the progress bar
          />
          <span style={{ marginLeft: '15px', whiteSpace: 'nowrap', width: '150px' }}>
            {downloadProgress.percentage.toFixed(2)}% at {formatSpeed(downloadProgress.transfer_rate)}
          </span>
        </div>
      )}
  
      {/* Right-aligned version code */}
      <div style={{ paddingRight: '10px' }}>
        <Code fw={700} style={{
          color: theme.colors[theme.primaryColor][4],
        }}>Alpha v0.0.1</Code>
      </div>
    </AppShell.Header>
  );
};

export default HeaderComponent;
