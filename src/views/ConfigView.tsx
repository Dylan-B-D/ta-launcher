// ConfigView.tsx

import { useState } from 'react';
import { Divider, Paper, Space, Switch, useMantineTheme } from '@mantine/core';
import LogFileCleanup from '../components/LogFileCleanup';
import DirectoryShortcuts from '../components/DirectoryShortcuts';
import ConfigToggleSection from '../components/ConfigToggleSection';

const ConfigView = () => {
  const theme = useMantineTheme();
  const [isAdvancedMode, setAdvancedMode] = useState(false);

  const handleModeToggle = () => {
    setAdvancedMode(!isAdvancedMode);
  };

  return (
    <div>
      <LogFileCleanup />
      <Space h='md' />
      <DirectoryShortcuts />
      <Space h='md' />

      <Paper style={{
        border: `${theme.colors.dark[4]} 1px solid`,
        borderRadius: '8px',
        padding: '10px',
      }}>
        <Switch
          label={isAdvancedMode ? 'Advanced Mode' : 'Simple Mode'}
          checked={isAdvancedMode}
          onChange={handleModeToggle}
          size="md"
        />
        <Divider my="sm" />
        <ConfigToggleSection isAdvancedMode={isAdvancedMode} />
      </Paper>
    </div>
  );
};

export default ConfigView;
