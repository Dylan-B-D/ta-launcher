// SettingsView.tsx

import React, { useEffect, useState } from "react";
import {
  Switch,
  Select,
  Paper,
  Title,
  Box,
  useMantineTheme,
  Space,
  MantineTheme,
} from "@mantine/core";
import { useThemeContext } from "../context/ThemeContext";
import { invoke } from "@tauri-apps/api/tauri";
import { useSettingsContext } from "../context/SettingsContext";

interface SettingsProps {
  // Add props
}

interface FontOption {
  value: string;
  label: string;
}

const SettingsView: React.FC<SettingsProps> = () => {
  async function fetchSystemFonts(): Promise<string[]> {
    try {
      const fonts: string[] = await invoke("get_system_fonts");
      return fonts;
    } catch (error) {
      console.error("Error fetching system fonts:", error);
      return []; // Return an empty array in case of an error
    }
  }

  useEffect(() => {
    fetchSystemFonts().then((fonts) => {
      const fontOptions: FontOption[] = fonts.map((font) => ({
        value: font,
        label: font,
      }));
      setFontFamilyOptions(fontOptions);
    });
  }, []);

  const [dlls, setDlls] = React.useState([]);
  async function loadDlls() {
    try {
      const dlls: string[] = await invoke("get_available_dlls");
      // dlls is now a list of strings returned from your command
      // Populate your Mantine dropdown here
      return dlls;
    } catch (error) {
      console.error("Error fetching DLLs:", error);
    }
  }
  useEffect(() => {
    loadDlls().then(setDlls);
  }, []);

  // State hooks for each setting
  const theme = useMantineTheme();

  const { setPrimaryColor } = useThemeContext();
  const [selectedColor, setSelectedColor] = useState<string>(
    theme.primaryColor
  );

  // const { setSecondaryColor } = useThemeContext();
  // const [selectedColorSecondary, setSelectedColorSecondary] = useState<string>(theme.secondaryColor);

  const { setTertiaryColor } = useThemeContext();
  const [selectedColorTertiary, setSelectedColorTertiary] = useState<string>(
    theme.tertiaryColor
  );

  const [fontFamilyOptions, setFontFamilyOptions] = useState<FontOption[]>([]);
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(
    theme.fontFamily || "DefaultFont"
  );
  const { setPrimaryFontFamily } = useThemeContext();

  const { setSecondaryFontFamily, secondaryFontFamily } = useThemeContext();

  const [selectedSecondaryFontFamily, setSelectedSecondaryFontFamily] =
    useState<string>(secondaryFontFamily);

  const { manualInjection, setManualInjection } = useSettingsContext();
  const { tamodsVersion, setTAModsVersion } = useSettingsContext();
  //const [injectionOrder, setInjectionOrder] = useState<string>('default');
  // const [executableOverride, setExecutableOverride] = useState<string>('');
  // const [multiInjection, setMultiInjection] = useState<boolean>(false);
  // const [customConfigPath, setCustomConfigPath] = useState<string>('');
  // const [additionalLoginServer, setAdditionalLoginServer] = useState<string>('');

  const handleTAModsVersionChange = (setValue: any) => (dllValue: any) => {
    if (dllValue !== null) {
      setValue(dllValue);
    }
  };

  const handleColorChange =
    (setValue: any, setSelectedValue: any) => (colorValue: any) => {
      if (colorValue !== null) {
        setValue(colorValue);
        setSelectedValue(colorValue);
      }
    };

  const extractColorOptions = (theme: MantineTheme) => {
    const mutedColors: { value: string; label: string }[] = [];
    const otherColors: { value: string; label: string }[] = [];
    Object.keys(theme.colors).forEach((colorName) => {
      const option = {
        value: colorName,
        label: colorName.charAt(0).toUpperCase() + colorName.slice(1),
      };
      colorName.includes("muted")
        ? mutedColors.push(option)
        : otherColors.push(option);
    });

    return [
      { group: "Muted Colors", items: mutedColors },
      { group: "Other Colors", items: otherColors },
    ];
  };
  const changeTAModsVersion = handleTAModsVersionChange(setTAModsVersion);

  const changePrimaryColor = handleColorChange(
    setPrimaryColor,
    setSelectedColor
  );
  // const changeSecondaryColor = handleColorChange(setSecondaryColor, setSelectedColorSecondary);
  const changeTertiaryColor = handleColorChange(
    setTertiaryColor,
    setSelectedColorTertiary
  );
  const changePrimaryFontFamily = handleColorChange(
    setPrimaryFontFamily,
    setSelectedFontFamily
  );
  const changeSecondaryFontFamily = handleColorChange(
    setSecondaryFontFamily,
    setSelectedSecondaryFontFamily
  );

  const groupedColorOptions = extractColorOptions(theme);

  // Custom styles for Paper component
  const paperStyles = {
    root: {
      backgroundColor: "#1A1B1E", // Dark background
      color: "#FFFFFF", // Light text
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      marginBottom: "20px",
    },
  };

  return (
    <Box>
      <Title order={1} style={{ marginBottom: "20px" }}>
        Advanced Settings
      </Title>

      <Paper
        withBorder
        style={{
          ...paperStyles.root,
          ...theme.components.Paper.styles(theme).root,
        }}
      >
        <Title order={3}>General Settings</Title>
        {/* <TextInput
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
        /> */}
      </Paper>

      <Paper
        withBorder
        style={{
          ...paperStyles.root,
          ...theme.components.Paper.styles(theme).root,
        }}
      >
        <Title order={3}>Injection Settings</Title>
        <Space h="xs" />
        <Switch
          label="Manual Injection"
          checked={manualInjection}
          onChange={(event) => setManualInjection(event.currentTarget.checked)}
        />
        <Space h="xs" />
        <Select
          label="TA Mods version"
          placeholder="Pick value"
          data={dlls}
          value={tamodsVersion}
          defaultValue={tamodsVersion}
          onChange={changeTAModsVersion}
        />
      </Paper>

      <Paper
        withBorder
        style={{
          ...paperStyles.root,
          ...theme.components.Paper.styles(theme).root,
        }}
      >
        <Title order={3}>Theme Customization</Title>
        <Title order={5}>Colors</Title>
        <Select
          label="Action Color"
          value={selectedColor}
          onChange={changePrimaryColor}
          data={groupedColorOptions}
        />
        <Space h="md" />
        {/* <Select
          label="Secondary Color"
          value={selectedColorSecondary}
          onChange={changeSecondaryColor}
          data={groupedColorOptions}
          searchable
        />
        <Space h="md" /> */}
        <Select
          label="Background Color"
          value={selectedColorTertiary}
          onChange={changeTertiaryColor}
          data={groupedColorOptions}
          searchable
        />
        <Space h="md" />
        <Title order={5}>Fonts</Title>
        <Select
          label="Primary Font-Family"
          value={selectedFontFamily}
          onChange={changePrimaryFontFamily}
          data={fontFamilyOptions}
          searchable
        />
        <Space h="md" />
        <Select
          label="Secondary Font-Family"
          value={selectedSecondaryFontFamily}
          onChange={changeSecondaryFontFamily}
          data={fontFamilyOptions}
          searchable
        />
      </Paper>
    </Box>
  );
};

export default SettingsView;
