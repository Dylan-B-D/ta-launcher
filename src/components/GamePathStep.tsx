import React from 'react';
import { Button, Container, Paper, Space, Text, TextInput } from '@mantine/core';
import { open } from '@tauri-apps/plugin-dialog';
import { useConfig } from '../contexts/ConfigContext';
import { findGamePath } from '../utils/utils';

interface GamePathStepProps {
  gamePathError: boolean;
  setGamePathError: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GamePathStep: React.FC<GamePathStepProps> = ({
  gamePathError,
  setGamePathError,
}) => {
  const { config, setConfig } = useConfig();

  const handleGamePathChange = (value: string) => {
    const trimmedValue = value.trim();
    setConfig((prevConfig) => ({ ...prevConfig, gamePath: value }));
    setGamePathError(trimmedValue === '');
  };

  const selectFile = async () => {
    try {
      const selected = await open();

      if (selected && typeof selected.path === "string" && selected.path.endsWith(".exe")) {
        setConfig((prevConfig: any) => ({ ...prevConfig, gamePath: selected.path }));
        setGamePathError(false);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <>
      <Space h="sm" />
      <Container style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
        <Paper shadow="xs" p="md" style={{ width: '100%' }}>
          <Text size="sm" c="dimmed">
            A Tribes: Ascend installation is required. (<strong>Recommended:</strong> Steam version)
          </Text>
          <Space h="md" />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button
              component="a"
              href="steam://install/17080"
              variant="light"
              color="cyan"
              style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}
            >
              Steam Install
            </Button>
            <Button
              component="a"
              href="https://library.theexiled.pwnageservers.com/file.php?id=2962"
              target="_blank"
              variant="light"
              color="rgb(200,200,100)"
              style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}
            >
              Non-Steam Install
            </Button>
          </div>
        </Paper>
      </Container>
      <Space h="md" />
      <Container>
        <Paper shadow="xs" p="md" style={{ width: '100%' }}>
          <Text ta='center' size="sm" c="dimmed">
            If the path to the TribesAscend.exe executable is not detected, you can manually add it.
          </Text>
          <Text ta='center' size="sm" c="dimmed">
            The executable is usually located in: '..\Tribes\Binaries\Win32\TribesAscend.exe'
          </Text>
          <Space h="lg" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TextInput
              style={{ flexGrow: 1 }}
              value={config.gamePath}
              onChange={(e) => handleGamePathChange(e.currentTarget.value)}
              placeholder="Enter game path..."
              error={gamePathError}
              styles={{
                input: { padding: '6px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' },
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <Button color="cyan" variant='light' onClick={selectFile} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}>Choose File</Button>
            <Button color="cyan" variant='light' onClick={() => findGamePath(setConfig)} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}>Find Steam Game Path</Button>
          </div>
          {gamePathError && <Text mt='md' size="sm" c="red">*Game path is required</Text>}
        </Paper>
      </Container>
    </>
  );
};
