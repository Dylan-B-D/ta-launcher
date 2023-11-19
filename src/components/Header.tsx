// HeaderComponent.tsx
import React, { useEffect, useState } from 'react';
import { AppShell, Badge, Code, Progress, useMantineTheme } from '@mantine/core';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { formatSpeed, hexToRgba } from '../utils.ts';

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
          background: `linear-gradient(135deg, ${theme.colors.dark[6]} 0%, ${theme.colors.dark[6]} 50%, ${theme.colors[theme.tertiaryColor][9]} 100%)`,
          boxShadow: `0 4px 8px 0 ${hexToRgba(theme.colors.dark[9], 0.2)}, 0 6px 20px 0 ${hexToRgba(theme.colors[theme.tertiaryColor][9], 0.3)}`,
        },
      })}
    >
      {/* Left-aligned badges */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
      <Badge 
          variant="gradient"
          style={{
            borderRadius: '4px',
            background: `linear-gradient(90deg, ${theme.colors.dark[4]} 0%, ${theme.colors[theme.primaryColor][7]} 50%, ${theme.colors.dark[4]} 100%)`,
            marginLeft: '10px', 
            color: theme.colors.gray[3],
            fontWeight:"normal",
            boxShadow: `0 4px 8px 0 ${hexToRgba(theme.colors.dark[9], 0.4)}, 0 6px 20px 0 ${hexToRgba(theme.colors[theme.primaryColor][9], 0.3)}`,
          }}
        >
          Community: <strong><span style={{ color: theme.colors.green[4] }}>{playerCounts.Community}</span></strong>
        </Badge>
        <Badge 
          variant="gradient"
          style={{
            borderRadius: '4px',
            background: `linear-gradient(90deg, ${theme.colors.dark[4]} 0%, ${theme.colors[theme.primaryColor][7]} 50%, ${theme.colors.dark[4]} 100%)`,
            marginLeft: '10px', 
            color: theme.colors.gray[3],
            fontWeight:"normal",
            boxShadow: `0 4px 8px 0 ${hexToRgba(theme.colors.dark[9], 0.4)}, 0 6px 20px 0 ${hexToRgba(theme.colors[theme.primaryColor][9], 0.3)}`,
          }}
        >
          PUG: <strong><span style={{ color: theme.colors.green[4] }}>{playerCounts.PUG}</span></strong>
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
          color: theme.colors.gray[4],
          background: `linear-gradient(90deg, ${theme.colors.dark[5]} 0%, ${theme.colors[theme.primaryColor][9]} 50%, ${theme.colors.dark[5]} 100%)`,
        }}>Alpha v0.1.0</Code>
      </div>
    </AppShell.Header>
  );
};

export default HeaderComponent;
