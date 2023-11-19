// ConfigView.tsx

import { useState } from 'react';
import { Paper, Space, Switch } from '@mantine/core';
import LogFileCleanup from '../components/LogFileCleanup';
import DirectoryShortcuts from '../components/DirectoryShortcuts';
import ConfigToggleSection from '../components/ConfigToggleSection';

const ConfigView = () => {
  const [isAdvancedMode, setAdvancedMode] = useState(false);

  const handleModeToggle = () => {
    setAdvancedMode(!isAdvancedMode);
  };

  return (
    <div>
      <LogFileCleanup />
      <Space h='md' />
      <DirectoryShortcuts />
      
      <Paper style={{ padding: '1rem' }}>
        <Switch
          label={isAdvancedMode ? 'Advanced Mode' : 'Simple Mode'}
          checked={isAdvancedMode}
          onChange={handleModeToggle}
        />
        <ConfigToggleSection isAdvancedMode={isAdvancedMode} />
      </Paper>
    </div>
  );
};

export default ConfigView;
