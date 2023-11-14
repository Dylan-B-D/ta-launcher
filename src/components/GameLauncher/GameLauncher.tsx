// GameLauncher.tsx

import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Card, Image, Button, Text, useMantineTheme, Group, TextInput, ActionIcon } from '@mantine/core';
import { FaCirclePlay, FaFolderOpen } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import classes from './GameLauncher.module.css';

const GameLauncher: React.FC = () => {
  const theme = useMantineTheme();
  const [launchType, setLaunchType] = useState('Steam');
  const [loginServer, setLoginServer] = useState('Community');
  const [exePath, setExePath] = useState('');
  const [customServer, setCustomServer] = useState('');

  const startGame = async () => {
    try {
      // Determine the appropriate launch argument based on the selected login server
      let launchArg;
      switch (loginServer) {
        case 'Community':
          launchArg = '-hostx=ta.kfk4ever.com';
          break;
        case 'PUG':
          launchArg = '-hostx=Ta.dodgesdomain.com';
          break;
        case 'Custom':
          // Temporary argument for Custom, can be updated later
          launchArg = '-hostx=Ta.dodgesdomain.com';
          break;
        default:
          launchArg = '';
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
  

  const buttonStyle = (selected: boolean) => ({
    backgroundColor: selected ? theme.colors.mutedBlue[9] : 'rgba(0, 0, 0, 0.1)',
    color: selected ? theme.colors.darkGray[3] : theme.colors.lightGray[3],
    fontWeight: selected ? 'bold' : 'normal',
  });

  return (
    <Card 
      shadow="lg" 
      padding="lg" 
      radius="sm" 
      style={{ backgroundColor: '#2C3E50', maxWidth: '350px', margin: 'auto' }}
    >
      <Card.Section>
        <Image
          src="https://i.ibb.co/4dxGMxq/ds.jpg"
          height={160}
          alt="Tribes Ascend"
        />
      </Card.Section>

      <Text className={classes.title} size="lg" style={{ textAlign: 'center', marginTop: '1rem', color: theme.colors.lightGray[4] }}>
        Tribes: Ascend Launcher
      </Text>

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
        <Group grow>
          <ActionIcon>
            <FaFolderOpen />
          </ActionIcon>
          <TextInput
            value={exePath}
            onChange={(event) => setExePath(event.currentTarget.value)}
            description="Tribes Ascend executable path"
            placeholder="Path to executable"
            error="Invalid Path"
            styles={{
              input: {
                color: 'black',
                backgroundColor: 'lightgray',
                width: '100%'
              },
            }}
          />
          <ActionIcon>
            <FaSearch />
          </ActionIcon>
        </Group>
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
