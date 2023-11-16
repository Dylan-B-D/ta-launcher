// SettingsView.tsx

import React, { useEffect, useState } from 'react';
import { TextInput, Switch, Select, Paper, Title, Box, useMantineTheme, Space } from '@mantine/core';
import { useThemeContext } from '../../context/ThemeContext';
import { invoke } from '@tauri-apps/api/tauri';

interface SettingsProps {
  // Add props
}

interface FontOption {
  value: string;
  label: string;
}


const SettingsView: React.FC<SettingsProps> = () => {
  // State hooks for each setting
  const theme = useMantineTheme();

  const { setPrimaryColor } = useThemeContext();
  const [selectedColor, setSelectedColor] = useState<string>(theme.primaryColor);

  const { setSecondaryColor } = useThemeContext();
  const [selectedColorSecondary, setSelectedColorSecondary] = useState<string>(theme.secondaryColor);

  const { setTertiaryColor } = useThemeContext();
  const [selectedColorTertiary, setSelectedColorTertiary] = useState<string>(theme.tertiaryColor);

  const [fontFamilyOptions, setFontFamilyOptions] = useState<FontOption[]>([]);
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(theme.fontFamily || "DefaultFont");
  const { setPrimaryFontFamily } = useThemeContext();

  const [manualInjection, setManualInjection] = useState<boolean>(false);
  const [injectionOrder, setInjectionOrder] = useState<string>('default');
  const [executableOverride, setExecutableOverride] = useState<string>('');
  const [multiInjection, setMultiInjection] = useState<boolean>(false);
  const [customConfigPath, setCustomConfigPath] = useState<string>('');
  const [additionalLoginServer, setAdditionalLoginServer] = useState<string>('');

  async function fetchSystemFonts(): Promise<string[]> {
    try {
      const fonts: string[] = await invoke('get_system_fonts');
      return fonts;
    } catch (error) {
      console.error('Error fetching system fonts:', error);
      return []; // Return an empty array in case of an error
    }
  }
  

  useEffect(() => {
    fetchSystemFonts().then(fonts => {
      const fontOptions: FontOption[] = fonts.map(font => ({ value: font, label: font }));
      setFontFamilyOptions(fontOptions);
    });
  }, []);  
  

  // Extract color names from the theme
  const mutedColors: { value: string; label: string; }[] = [];
  const otherColors: { value: string; label: string; }[] = [];
  Object.keys(theme.colors).forEach(colorName => {
    const option = { value: colorName, label: colorName.charAt(0).toUpperCase() + colorName.slice(1) };
    if (colorName.includes('muted')) {
      mutedColors.push(option);
    } else {
      otherColors.push(option);
    }
  });

  const groupedColorOptions = [
    { group: 'Muted Colors', items: mutedColors },
    { group: 'Other Colors', items: otherColors },
  ];

  const handleColorChange = (value: string | null) => {
    if (value !== null) {
      setPrimaryColor(value);
      setSelectedColor(value);
    }
  };

  const handleColorChangeSecondary = (value: string | null) => {
    if (value !== null) {
      setSecondaryColor(value);
      setSelectedColorSecondary(value);
    }
  };

  const handleColorChangeTertiary = (value: string | null) => {
    if (value !== null) {
      setTertiaryColor(value);
      setSelectedColorTertiary(value);
    }
  };

  const handleChangeFontFamily = (value: string | null) => {
    if (value !== null) {
      setPrimaryFontFamily(value);
      setSelectedFontFamily(value);
    }
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
          <Space h="md" />
          <TextInput
            label="Custom Config Path"
            placeholder="Path to config"
            value={customConfigPath}
            onChange={(event) => setCustomConfigPath(event.currentTarget.value)}
          />
          <Space h="md" />
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
          <Space h="md" />
          <Switch
            label="Multi Injection"
            checked={multiInjection}
            onChange={(event) => setMultiInjection(event.currentTarget.checked)}
          />
          <Space h="md" />
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
            label="Primary Color"
            value={selectedColor}
            onChange={handleColorChange}
            data={groupedColorOptions}
          />
          <Space h="md" />
          <Select
              label="Secondary Color"
              value={selectedColorSecondary}
              onChange={handleColorChangeSecondary}
              data={groupedColorOptions}
            />
          <Space h="md" />
          <Select
              label="Tertiary Color"
              value={selectedColorTertiary}
              onChange={handleColorChangeTertiary}
              data={groupedColorOptions}
            />
          <Space h="md" />
          <Select
            label="Primary Font-Family"
            value={selectedFontFamily}
            onChange={handleChangeFontFamily}
            data={fontFamilyOptions}
          />
        </Paper>

      </Box>
  );
};

export default SettingsView;
