import { Container, Button, Title, Space, Text, Paper, Divider, TextInput } from "@mantine/core";
import LaunchOptionsStep from "../LaunchOptionsStep";
import { open } from '@tauri-apps/plugin-dialog';
import { useConfig } from "../../contexts/ConfigContext";
import { findGamePath } from "../../utils/utils";
import { Config } from "../../interfaces";

const SettingsPage = () => {
  const { config, setConfig } = useConfig();

  const handleButtonClick = () => {
    localStorage.setItem("isFirstTime", "true");
    window.location.reload();
  };

  const handleInputChange = (field: keyof Config) => (value: string) => {
    setConfig((prevConfig) => ({ ...prevConfig, [field]: value }));
  };

  const selectFile = async (field: 'gamePath') => {
    try {
      const selected = await open();

      if (selected && typeof selected.path === "string") {
        if (field === 'gamePath' && !selected.path.endsWith(".exe")) return;
        
        setConfig((prevConfig) => ({ ...prevConfig, [field]: selected.path }));
      }
    } catch (error) {
      console.error(`Error selecting file for ${field}:`, error);
    }
  };

  return (
    <Container>
      <Space h='xs'/>
      <Paper shadow="sm" p="lg" radius='lg'>
        <Title order={3}><u>Settings</u></Title>
        <Space h='md'/>
        <Text c='dimmed'>Return to the first time setup</Text>
        <Button color="cyan" variant='light' onClick={handleButtonClick} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}>Return to First Time Setup</Button>
        <Divider my='md'/>
        
        <Title order={4}>Game Path</Title>
        <Space h='2px'/>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TextInput
            style={{ flexGrow: 1 }}
            value={config.gamePath}
            onChange={(e) => handleInputChange('gamePath')(e.currentTarget.value)}
            placeholder="Enter game path..."
            error={config.gamePath === ''}
            styles={{
              input: { padding: '6px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' },
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <Button color="cyan" variant='light' onClick={() => selectFile('gamePath')} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}>Choose File</Button>
          <Button color="cyan" variant='light' onClick={() => findGamePath(setConfig)} style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' }}>Find Steam Game Path</Button>
        </div>
        
        <Divider my='md'/>
        
        <Title order={4}>Launch Arguments</Title>
        <Space h='2px'/>
        <TextInput
          value={config.launchArgs}
          onChange={(e) => handleInputChange('launchArgs')(e.currentTarget.value)}
          placeholder="Enter launch arguments (comma-separated)..."
          styles={{
            input: { padding: '6px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' },
          }}
        />
        
        <Divider my='md'/>
        <LaunchOptionsStep />
                
      </Paper>
      <Space h='xs'/>
    </Container>
  );
};

export default SettingsPage;