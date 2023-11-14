// GameLauncher.tsx

import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Card, Image, Button, Text, useMantineTheme, Group, TextInput, Textarea, Collapse } from '@mantine/core';
import { FaCirclePlay, FaFolderOpen } from 'react-icons/fa6';
import { FaSearch, FaCog  } from 'react-icons/fa';
import classes from './GameLauncher.module.css';
import { dialog } from '@tauri-apps/api';

const GameLauncher: React.FC = () => {
  const theme = useMantineTheme();
  const [launchType, setLaunchType] = useState(localStorage.getItem('launchType') || 'Steam');
  const [loginServer, setLoginServer] = useState(localStorage.getItem('loginServer') || 'Community');
  const [exePath, setExePath] = useState(localStorage.getItem('exePath') || '');
  const [customServer, setCustomServer] = useState(localStorage.getItem('customServer') || '');
  const [isNonSteamOptionsOpen, setIsNonSteamOptionsOpen] = useState(false);

  useEffect(() => {
    const savedLaunchType = localStorage.getItem('launchType');
    const savedLoginServer = localStorage.getItem('loginServer');
    const savedExePath = localStorage.getItem('exePath');
    const savedCustomServer = localStorage.getItem('customServer');

    if (savedLaunchType) setLaunchType(savedLaunchType);
    if (savedLoginServer) setLoginServer(savedLoginServer);
    if (savedExePath) setExePath(savedExePath);
    if (savedCustomServer) setCustomServer(savedCustomServer);
  }, []);

  // Update local storage when states change
  useEffect(() => {
    localStorage.setItem('launchType', launchType);
    localStorage.setItem('loginServer', loginServer);
    localStorage.setItem('exePath', exePath);
    localStorage.setItem('customServer', customServer);
  }, [launchType, loginServer, exePath, customServer]);


  const startGame = async () => {
    try {
      let launchArg;
      if (loginServer === 'Custom' && customServer) {
        // Append '-hostx=' to the custom server IP
        launchArg = `-hostx=${customServer}`;
      } else {
        // For predefined servers, use their respective launch arguments
        switch (loginServer) {
          case 'Community':
            launchArg = '-hostx=ta.kfk4ever.com';
            break;
          case 'PUG':
            launchArg = '-hostx=Ta.dodgesdomain.com';
            break;
          default:
            launchArg = '';
        }
      }
  
      let options = {
        exePath,
        launchArg,
      };
  
      if (launchType === 'Steam') {
        // Call the Rust function for Steam
        await invoke("launch_game", { options });
        console.log("Tribes Ascend launched successfully with Steam options:", options);
      } else if (launchType === 'Non Steam') {
        // Call the Rust function for Non-Steam
        await invoke("launch_game_non_steam", { options });
        console.log("Tribes Ascend launched successfully with Non-Steam options:", options);
      }
    } catch (error) {
      console.error("Failed to launch Tribes Ascend", error);
    }
  };

  const handleOpenFile = async () => {
    try {
      const selected = await dialog.open({
        filters: [{ name: 'Executable', extensions: ['exe'] }],
        multiple: false,
      });

      if (selected && typeof selected === 'string') {
        setExePath(selected);
      }
    } catch (error) {
      console.error("Error opening file chooser:", error);
    }
  };

  const buttonStyle = (selected: boolean) => ({
    backgroundColor: selected ? theme.colors.mutedBlue[9] : 'rgba(0, 0, 0, 0.1)',
    color: selected ? theme.colors.darkGray[3] : theme.colors.lightGray[3],
    fontWeight: selected ? 'bold' : 'normal',
  });

  useEffect(() => {
    // Automatically open advanced settings if Non Steam is selected and exePath is empty
    if (launchType === 'Non Steam' && !exePath) {
      setIsNonSteamOptionsOpen(true);
    }
  }, [launchType, exePath]);

  const toggleNonSteamOptions = () => {
    setIsNonSteamOptionsOpen(!isNonSteamOptionsOpen);
  };


  return (
    <Card 
      shadow="lg" 
      padding="lg" 
      radius="sm" 
      style={{ backgroundColor: '#2C3E50', maxWidth: '350px', margin: 'auto' }}
    >
      <Card.Section style={{ position: 'relative' }}>
    <Image
      src="http://2.bp.blogspot.com/-6n4vKnqI6nw/T68hef_YuXI/AAAAAAAABEE/dSq-jfdxkdE/s640/IlyaNazarov_Tribes1.jpg"
      alt="Tribes Ascend"
      style={{ width: '100%', maxHeight: '80px' }}
    />
    <Text 
      size="lg" 
      style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        color: theme.colors.lightGray[4],
        textAlign: 'center',
        fontWeight: 'bold',
        textShadow: '0 0px 4px rgba(0, 0, 0, 1)',
        background: 'radial-gradient(closest-side, rgba(0,0,0,0.5),  transparent)',
        borderRadius: '4px',
        padding: '16px',
      }}
    >
      Tribes: Ascend Launcher
    </Text>
  </Card.Section>

      <Text 
      size="sm" 
      style={{ 
        marginTop: '1rem', 
        color: theme.colors.lightGray[7],
        fontWeight: 'bold',
       }}
      >Launch Type:</Text>
      <Button.Group>
        <Button 
          onClick={() => setLaunchType('Steam')} 
          style={buttonStyle(launchType === 'Steam')}
        >
          Steam
        </Button>
        <Button 
          onClick={() => setLaunchType('Non Steam')} 
          style={buttonStyle(launchType === 'Non Steam')}
        >
          Non Steam
        </Button>
      </Button.Group>

      {launchType === 'Non Steam' && (
        <>
          <Group>
            <Text size="sm" style={{ fontWeight: 'bold', color: theme.colors.mutedBlue[8] }}>Executable Path:</Text>
            <Button onClick={toggleNonSteamOptions} style={{ color: theme.colors.mutedBlue[8]}}>
              <FaCog size={16} />
            </Button>
          </Group>
          <Collapse in={isNonSteamOptionsOpen}>
            <Textarea
              value={exePath}
              onChange={(event) => setExePath(event.target.value)}
              label="Tribes Ascend executable path"
              placeholder="Path to executable"
              error={!exePath && "Invalid Path"}
              autosize
              styles={{
                label: { color: theme.colors.lightGray[9], fontWeight: 'normal'},
                input: {
                  color: 'black',
                  backgroundColor: 'lightgray',
                  width: '100%'
                },
              }}
              minRows={3}
              maxRows={4}
            />
            <Group>
              <Button onClick={handleOpenFile}>
                <span style={{ marginRight: '8px' }}>Open</span>
                <FaFolderOpen />
              </Button>
              <Button onClick={() => {/* Implement Search Logic */}}>
                <span style={{ marginRight: '8px' }}>Search</span>
                <FaSearch />
              </Button>
            </Group>

          </Collapse>
        </>
      )}

    <Text 
      size="sm" 
      style={{ 
        marginTop: '1rem', 
        color: theme.colors.lightGray[7],
        fontWeight: 'bold',
       }}
      >
        Login Server:</Text>
      <Button.Group>
        <Button 
          onClick={() => setLoginServer('Community')} 
          style={buttonStyle(loginServer === 'Community')}
        >
          Community
        </Button>
        <Button 
          onClick={() => setLoginServer('PUG')} 
          style={buttonStyle(loginServer === 'PUG')}
        >
          PUG
        </Button>
        <Button 
          onClick={() => setLoginServer('Custom')} 
          style={buttonStyle(loginServer === 'Custom')}
        >
          Custom
        </Button>
      </Button.Group>

      {loginServer === 'Custom' && (
        <TextInput
          label="Custom Login Server"
          placeholder="Enter custom server"
          value={customServer}
          onChange={(event) => setCustomServer(event.currentTarget.value)}
        />
      )}

      <Button 
        onClick={startGame} 
        variant="filled" 
        className={classes.customButton}
        style={{ backgroundColor: theme.colors.mutedAmber[6], color: theme.colors.darkGray[3] }}
        fullWidth 
        mt="md" 
        radius="xs"
        rightSection={<FaCirclePlay size={14} />}
      >
        Launch Tribes Ascend
      </Button>
    </Card>
  );
};

export default GameLauncher;
