// GameLauncher.tsx

import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Card, Image, Button, Text, useMantineTheme  } from '@mantine/core';
import { FaCirclePlay } from'react-icons/fa6';
import classes from './GameLauncher.module.css';


const GameLauncher: React.FC = () => {
  const theme = useMantineTheme();

  const startGame = async () => {
    try {
      await invoke("launch_game");
      console.log("Tribes Ascend launched successfully");
    } catch (error) {
      console.error("Failed to launch Tribes Ascend", error);
    }
  };

  return (
    <Card 
      shadow="lg" 
      padding="lg" 
      radius="sm" 
      style={{ backgroundColor: '#2C3E50', maxWidth: '350px', margin: 'auto' }} // Adjust size here
    >
      <Card.Section>
        <Image
          src="https://i.ibb.co/4dxGMxq/ds.jpg"
          height={160} // Adjusted height
          alt="Tribes Ascend"
        />
      </Card.Section>

      <Text className={classes.title} size="lg" style={{ textAlign: 'center', marginTop: '1rem', color: theme.colors.lightGray[4] }}>
        Tribes: Ascend Launcher
      </Text>

      <Text size="sm" style={{ marginTop: '0.5rem', color: '#CCCCCC' }}>
        
      </Text>

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