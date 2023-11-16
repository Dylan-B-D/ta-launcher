// SettingsView.tsx

import React, { useState } from 'react';
import { TextInput, Switch, Select, Button, Paper, Title, Box, Group, useMantineTheme } from '@mantine/core';
import { useThemeContext } from '../../context/ThemeContext';

interface SettingsProps {
  // Add any props you need here
}

const SettingsView: React.FC<SettingsProps> = () => {
  // State hooks for each setting
  const theme = useMantineTheme();
  const { setPrimaryColor } = useThemeContext();
  const [selectedColor, setSelectedColor] = useState<string>(theme.primaryColor);
  const [manualInjection, setManualInjection] = useState<boolean>(false);
  const [injectionOrder, setInjectionOrder] = useState<string>('default');
  const [executableOverride, setExecutableOverride] = useState<string>('');
  const [multiInjection, setMultiInjection] = useState<boolean>(false);
  const [customConfigPath, setCustomConfigPath] = useState<string>('');
  const [additionalLoginServer, setAdditionalLoginServer] = useState<string>('');

  // Extract color names from the theme
  const colorOptions = Object.keys(theme.colors).map(colorName => ({
    value: colorName,
    label: colorName.charAt(0).toUpperCase() + colorName.slice(1), // Capitalize the first letter
  }));

  const handleColorChange = (value: string | null) => {
    if (value !== null) {
      setPrimaryColor(value);
    }
    // Handle the `null` case if needed
  };

  const handleSaveSettings = () => {
    // Implement save settings logic
  };

  // Custom styles for Paper component
  const paperStyles = {
    root: {
      backgroundColor: '#1A1B1E', // Dark background
      color: '#FFFFFF', // Light text
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      marginBottom: '20px',
    }
  };

  return (
      <Box>
        <Title order={1} style={{ marginBottom: '20px' }}>Advanced Settings</Title>

        <Paper withBorder style={paperStyles.root}>
          <Title order={3}>General Settings</Title>
          <TextInput
            label="Executable Override"
            placeholder="Path to executable"
            value={executableOverride}
            onChange={(event) => setExecutableOverride(event.currentTarget.value)}
          />
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
        </Paper>

        <Paper withBorder style={paperStyles.root}>
          <Title order={3}>Injection Settings</Title>
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
        </Paper>

        <Paper withBorder style={paperStyles.root}>
          <Title order={3}>Theme Customization</Title>
          <Select
              label="Theme Color"
              value={selectedColor}
              onChange={handleColorChange}
              data={colorOptions}
            />
          {/* Add more theme customization options here */}
        </Paper>

        <Group mt="md">
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </Group>
      </Box>
  );
};

export default SettingsView;
