// SettingsView.tsx

import React, { useState } from 'react';
import {  Switch, Select, Button, Paper, Title, Box, Group, Divider, useMantineTheme, Textarea } from '@mantine/core';

interface SettingsProps {
  // Define additional props
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
    backgroundColor: '#1A1B1E',
    color: '#E4E4E4', 
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    padding: '16px', 
    margin: '8px',
  };
  

  const handleSaveSettings = () => {
    // Implement save settings logic
  };
  const theme = useMantineTheme();

  return (
      <Paper shadow="sm" style={paperStyle}>
        <Title order={2} style={{color: theme.colors.mutedBlue[7], fontWeight: 'bold'}}>Advanced Settings</Title>
        
        <Divider my="sm" />

        <Box mt="md">
          <Title order={4} style={{color: theme.colors.lightGray[9]}}>General</Title>
          <Textarea
            label="Steam ID Ovveride"
            placeholder="Path to executable"
            value={executableOverride}
            variant='unstyled'
            onChange={(event) => setExecutableOverride(event.currentTarget.value)}
              autosize
              styles={{
                
                label: { color: theme.colors.lightGray[9], fontWeight: 'normal' },
                input: {
                  backgroundColor: theme.colors.darkGray[4],
                  paddingLeft: '10px',
                },
              }}
              minRows={1}
              maxRows={2}
            />
          <Select
            label="Theme"
            value={customTheme}
            //onChange={setTheme}
            data={['dark', 'light', 'default']}
            variant='unstyled'
            styles={{
                label: { color: theme.colors.lightGray[9], fontWeight: 'normal' },
                input: {
                    backgroundColor: theme.colors.darkGray[4],
                    color: theme.colors.lightGray[9],
                    paddingLeft: '10px',
                },
              }}
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
            variant='unstyled'
            data={['default', 'option1', 'option2']}
            styles={{
                label: { color: theme.colors.lightGray[9], fontWeight: 'normal' },
                input: {
                    backgroundColor: theme.colors.darkGray[4],
                    paddingLeft: '10px',
                    color: theme.colors.lightGray[9],
                },
              }}
          />
        </Box>

        <Divider my="sm" />

        <Box mt="md">
          <Title order={4}>Paths and Servers</Title>
          <Textarea
            label="Custom Config Path"
            placeholder="Path to config"
            value={customConfigPath}
            variant='unstyled'
            onChange={(event) => setCustomConfigPath(event.currentTarget.value)}
              autosize
              styles={{
                label: { color: theme.colors.lightGray[9], fontWeight: 'normal' },
                input: {
                  backgroundColor: theme.colors.darkGray[4],
                  paddingLeft: '10px',
                },
              }}
              minRows={1}
              maxRows={2}
            />
            <Textarea
            label="Additional Login Server"
            placeholder="URL"
            value={additionalLoginServer}
            variant='unstyled'
            onChange={(event) => setAdditionalLoginServer(event.currentTarget.value)}
              autosize
              styles={{
                label: { color: theme.colors.lightGray[9], fontWeight: 'normal' },
                input: {
                  backgroundColor: theme.colors.darkGray[4],
                  paddingLeft: '10px',
                },
              }}
              minRows={1}
              maxRows={2}
            />
        </Box>

        <Group mt="md">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </Group>
      </Paper>
  );
};

export default SettingsView;
