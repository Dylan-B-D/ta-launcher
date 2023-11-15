// SettingsView.tsx

import React, { useState } from 'react';
import { MantineProvider, TextInput, Switch, Select, Button, Paper, Title, Box, Group, Divider, useMantineTheme } from '@mantine/core';

interface SettingsProps {
  // Define any additional props you need here
}

const SettingsView: React.FC<SettingsProps> = () => {
  // State hooks for each setting
  const [customTheme, setTheme] = useState<string>('dark');
  const [manualInjection, setManualInjection] = useState<boolean>(false);
  const [injectionOrder, setInjectionOrder] = useState<string>('default');
  const [executableOverride, setExecutableOverride] = useState<string>('');
  const [multiInjection, setMultiInjection] = useState<boolean>(false);
  const [customConfigPath, setCustomConfigPath] = useState<string>('');
  const [additionalLoginServer, setAdditionalLoginServer] = useState<string>('');

  const paperStyle = {
    backgroundColor: '#1A1B1E', // Dark background
    color: '#E4E4E4', // Light text
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    padding: '16px', // Add padding
    margin: '8px', // Add margin
  };
  

  const handleSaveSettings = () => {
    // Implement save settings logic
  };
  const theme = useMantineTheme();

  return (
    <MantineProvider>
      <Paper shadow="sm" style={paperStyle}>
        <Title order={2} style={{color: theme.colors.mutedBlue[7], fontWeight: 'bold'}}>Advanced Settings</Title>
        
        <Divider my="sm" />

        <Box mt="md">
          <Title order={4} style={{color: theme.colors.lightGray[9]}}>General</Title>
          <TextInput
            label="Executable Override"
            placeholder="Path to executable"
            value={executableOverride}
            
            style={{color: theme.colors.lightGray[9] }}
            onChange={(event) => setExecutableOverride(event.currentTarget.value)}
          />
          <Select
            label="Theme"
            value={customTheme}
            //onChange={setTheme}
            data={['dark', 'light', 'default']}
          />
        </Box>

        <Divider my="sm" />

        <Box mt="md">
          <Title order={4}>Injection Settings</Title>
          <Switch
            label="Manual Injection"
            checked={manualInjection}
            onChange={(event) => setManualInjection(event.currentTarget.checked)}
          />
          <Switch
            label="Multi Injection"
            checked={multiInjection}
            onChange={(event) => setMultiInjection(event.currentTarget.checked)}
          />
          <Select
            label="Injection Order"
            value={injectionOrder}
            //onChange={setInjectionOrder}
            data={['default', 'option1', 'option2']}
          />
        </Box>

        <Divider my="sm" />

        <Box mt="md">
          <Title order={4}>Paths and Servers</Title>
          <TextInput
            label="Custom Config Path"
            placeholder="Path to config"
            value={customConfigPath}
            onChange={(event) => setCustomConfigPath(event.currentTarget.value)}
          />
          <TextInput
            label="Additional Login Server"
            placeholder="URL"
            value={additionalLoginServer}
            onChange={(event) => setAdditionalLoginServer(event.currentTarget.value)}
          />
        </Box>

        <Group mt="md">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </Group>
      </Paper>
    </MantineProvider>
  );
};

export default SettingsView;
