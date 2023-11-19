import { useState } from 'react';
import { TextInput } from '@mantine/core';

const SimpleConfigSection = () => {
  const [configValues, setConfigValues] = useState({
    resolution: '1920x1080', // Placeholder value
    volume: '75',            // Placeholder value
    language: 'English'      // Placeholder value
  });

  const handleConfigChange = (field: string) => (event: { target: { value: any; }; }) => {
    setConfigValues({ ...configValues, [field]: event.target.value });
  };

  return (
    <div>
      <TextInput
        label="Resolution"
        value={configValues.resolution}
        onChange={handleConfigChange('resolution')}
      />
      <TextInput
        label="Volume"
        value={configValues.volume}
        onChange={handleConfigChange('volume')}
      />
      <TextInput
        label="Language"
        value={configValues.language}
        onChange={handleConfigChange('language')}
      />
    </div>
  );
};

export default SimpleConfigSection;
