import React from 'react';
import { Button, Container, Paper, Space, Text, TextInput } from '@mantine/core';
import { open } from '@tauri-apps/plugin-dialog';
import { useConfig } from '../contexts/ConfigContext';

interface GamePathStepProps {
  gamePathError: boolean;
  handleGamePathChange: (value: string) => void;
  findGamePath: () => Promise<void>;
}

export const GamePathStep: React.FC<GamePathStepProps> = ({
  gamePathError,
  handleGamePathChange,
  findGamePath,
}) => {
  const { config, setConfig } = useConfig();
  const selectFile = async () => {
    try {
      const selected = await open();

      if (selected && typeof selected.path === "string" && selected.path.endsWith(".exe")) {
        setConfig((prevConfig: any) => ({ ...prevConfig, gamePath: selected.path }));
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <>
      <Space h="lg" />
      <Container style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
        <Paper className="card" shadow="xs" p="md" style={{ width: '100%' }}>
          <Text size="sm" mt="md" c="dimmed">
            A Tribes: Ascend installation is required. (<strong>Recommended:</strong> Steam version)
          </Text>
          <Space h="md" />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button
              component="a"
              href="steam://install/17080"
              variant="light"
              color="cyan"
            >
              Steam Install
            </Button>
            <Button
              component="a"
              href="https://library.theexiled.pwnageservers.com/file.php?id=2962"
              target="_blank"
              variant="light"
              color="rgb(200,200,100)"
            >
              Non-Steam Install
            </Button>
          </div>
          
        </Paper>
      </Container>
      <Space h="xl" />
      <Container>
        <Paper className="card" shadow="xs" p="md" style={{ width: '100%'}}>
        <Text ta='center' size="sm" c="dimmed" mt="md">
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
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <Button color="cyan" onClick={selectFile}>Choose File</Button>
            <Button color="cyan" onClick={findGamePath}>Find Steam Game Path</Button>
          </div>
          <div style={{ minHeight: '20px', marginTop: '10px', marginBottom: -10 }}>
            {gamePathError && <Text size="sm" c="red">*Game path is required</Text>}
          </div>
        </Paper>
      </Container>
    </>
  );
};