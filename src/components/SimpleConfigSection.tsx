import { useState, useEffect } from 'react';
import { TextInput, Switch, Space, Divider } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import SensitivityConverter from './SensitivityConverter';

interface ConfigValues {
  'Engine.PlayerInput:MouseSensitivity'?: string;
  'Engine.PlayerInput:FOVSetting'?: string;
  [key: string]: string | undefined;
}

type IniDataEntry = [string, string];


const SimpleConfigSection = () => {
  const [configValues, setConfigValues] = useState<ConfigValues>({});
  const mouseSensitivity = configValues['Engine.PlayerInput:MouseSensitivity'];
  const FOVSetting = configValues['Engine.PlayerInput:FOVSetting'];

  useEffect(() => {
    const fetchIniData = async () => {
      try {
        const tribesIniData = await invoke('parse_tribes_ini') as IniDataEntry[];
        const tribesInputIniData = await invoke('parse_tribes_input_ini') as IniDataEntry[];
        const combinedData = {
          ...Object.fromEntries(tribesIniData), 
          ...Object.fromEntries(tribesInputIniData)
        };
        setConfigValues(combinedData as ConfigValues);
      } catch (error) {
        console.error('Error fetching INI data:', error);
      }
    };
    fetchIniData();
  }, []);

  const handleConfigChange = (compositeKey: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.type === 'checkbox' 
      ? (event.currentTarget.checked ? 'True' : 'False') // Maintain original casing
      : event.target.value;
    setConfigValues({ ...configValues, [compositeKey]: newValue });
  };

  const renderInput = (key: string, value: string) => {
    const isBoolean = value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
    if (isBoolean) {
      return (
        <>
          <Switch
            key={key}
            label={key.split(':')[1]}
            checked={value === 'True'}
            onChange={handleConfigChange(key)} 
          />
          <Space h='md' />
        </>
      );
    } else {
      return (
        <TextInput
          key={key}
          label={key.split(':')[1]}
          value={value}
          onChange={handleConfigChange(key)}
        />
      );
    }
  };

  return (
    <div>
      <SensitivityConverter
        FOVSetting={parseFloat(FOVSetting || '')}
        mouseSensitivity={parseFloat(mouseSensitivity || '')}
      />
      <Divider my="sm" />
      {Object.entries(configValues).map(([compositeKey, value]) => 
        value ? renderInput(compositeKey, value) : null
      )}
    </div>
  );
};

export default SimpleConfigSection;
