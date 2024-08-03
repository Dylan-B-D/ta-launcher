import { Container, Button, Title, Space, Text, Paper, Divider, TextInput } from "@mantine/core";
import LaunchOptionsStep from "../LaunchOptionsStep";
import { open } from '@tauri-apps/plugin-dialog';
import { useConfig } from "../../contexts/ConfigContext";
import { findGamePath } from "../../utils/utils";

const SettingsPage = () => {
  const { config, setConfig } = useConfig();

  const handleButtonClick = () => {
    localStorage.setItem("isFirstTime", "true");
    window.location.reload();
  };

  const handleGamePathChange = (value: string) => {
    const trimmedValue = value.trim();
    setConfig((prevConfig) => ({ ...prevConfig, gamePath: trimmedValue }));
  };

  const selectFile = async () => {
    try {
      const selected = await open();

      if (selected && typeof selected.path === "string" && selected.path.endsWith(".exe")) {
        setConfig((prevConfig) => ({ ...prevConfig, gamePath: selected.path }));
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <Container>
      <Paper shadow="sm" p="lg" radius='lg'>
        <Title order={3}><u>Settings</u></Title>
        <Space h='md'/>
        <Text c='dimmed'>Return to the first time setup</Text>
        <Button color="cyan" variant='light' onClick={handleButtonClick}>Return to First Time Setup</Button>
        <Divider my='md'/>
        
        <Title order={4}>Game Path</Title>
        <Space h='2px'/>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TextInput
            style={{ flexGrow: 1 }}
            value={config.gamePath}
            onChange={(e) => handleGamePathChange(e.currentTarget.value)}
            placeholder="Enter game path..."
            styles={{
              input: { padding: '6px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' },
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <Button color="cyan" variant='light' onClick={selectFile} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}>Choose File</Button>
          <Button color="cyan" variant='light' onClick={() => findGamePath(setConfig)} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}>Find Steam Game Path</Button>
        </div>
        
        <Divider my='md'/>
        <LaunchOptionsStep />
      </Paper>
    </Container>
  );
};

export default SettingsPage;