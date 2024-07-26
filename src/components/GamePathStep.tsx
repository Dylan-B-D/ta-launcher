import React from 'react';
import { Button, Center, Space, Text, TextInput } from '@mantine/core';
import { open } from '@tauri-apps/plugin-dialog';

interface GamePathStepProps {
  config: { gamePath: string };
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  setFileFound: React.Dispatch<React.SetStateAction<null | boolean>>;
  gamePathError: boolean;
  handleGamePathChange: (value: string) => void;
  findGamePath: () => Promise<void>;
}

export const GamePathStep: React.FC<GamePathStepProps> = ({
  config,
  setConfig,
  setFileFound,
  gamePathError,
  handleGamePathChange,
  findGamePath,
}) => {

  const selectFile = async () => {
    try {
      const selected = await open();

      if (selected && typeof selected.path === "string" && selected.path.endsWith(".exe")) {
        setConfig((prevConfig: any) => ({ ...prevConfig, gamePath: selected.path }));
        setFileFound(true);
      } else {
        setFileFound(false);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <>
      <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
        <Text size="sm" mt="md" c="dimmed">
          A Tribes: Ascend installation is required. (<strong>Recommended:</strong> Steam version)
        </Text>
        <Space h="xl" />
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
            color="cyan"
          >
            Non-Steam Install
          </Button>
        </div>
        <Text size="sm" c="dimmed" mt="xl">
          If the path to the TribesAscend.exe executable is not detected, you can manually add it.
        </Text>
        <Text size="sm" c="dimmed">
          The executable is usually located in: '..\Tribes\Binaries\Win32\TribesAscend.exe'
        </Text>
      </Center>
      <Space h="xl" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TextInput
            style={{ flexGrow: 1 }}
            value={config.gamePath}
            onChange={(e) => handleGamePathChange(e.currentTarget.value)}
            placeholder="Enter game path..."
            error={gamePathError}
          />
          <Button color="cyan" onClick={selectFile}>Choose File</Button>
        </div>
        <div style={{ minHeight: '20px' }}>
          {gamePathError && <Text size="sm" c="red">*Game path is required</Text>}
        </div>
      </div>
      <Space h="sm" />
      <Center>
        <Button color="cyan" onClick={findGamePath}>Find Steam Game Path</Button>
      </Center>
    </>
  );
};