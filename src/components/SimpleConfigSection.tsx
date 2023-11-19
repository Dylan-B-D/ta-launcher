import { useState, useEffect } from 'react';
import { TextInput, Switch, Space, Button, useMantineTheme } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import SensitivityConverter from './SensitivityConverter';
import { showNotification } from '@mantine/notifications';
import classes from './../styles.module.css';
import { hexToRgba } from '../utils';

interface ConfigValues {
  'Engine.PlayerInput:MouseSensitivity'?: string;
  'Engine.PlayerInput:FOVSetting'?: string;
  [key: string]: string | undefined;
}

type IniDataEntry = [string, string];

const SimpleConfigSection = () => {
  const theme = useMantineTheme();
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

  const saveConfigChanges = async () => {
    try {
      const updatedValues = Object.entries(configValues);
      await invoke('update_ini_file', { updatedValues });
      console.log('Configuration updated successfully');
  
      // Display success notification
      showNotification({
        title: 'Config Updated',
        message: 'Changes have been saved.',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating configuration:', error);
  
      // Display error notification
      showNotification({
        title: 'Error Updating Config',
        message: 'Failed to save config changes.',
        color: 'red',
      });
    }
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
        <><TextInput
          key={key}
          label={key.split(':')[1]}
          value={value}
          onChange={handleConfigChange(key)} /><Space h={'6'} /></>
      );
    }
  };

  return (
    <div>
      <SensitivityConverter
        FOVSetting={parseFloat(FOVSetting || '')}
        mouseSensitivity={parseFloat(mouseSensitivity || '')}
      />
      <Space my="md" />
      {Object.entries(configValues).map(([compositeKey, value]) => 
        value ? renderInput(compositeKey, value) : null
      )}
      <Space h={'md'}/>
      <Button className={classes.buttonHoverEffect} onClick={saveConfigChanges} style={{
        color: theme.colors.gray[0],
        background: 
          `linear-gradient(45deg, 
            ${theme.colors.dark[6]} 0%, 
            ${theme.colors[theme.primaryColor][9]} 50%, 
            ${theme.colors.dark[6]} 100%)`,
        boxShadow: `0 1px 4px 2px ${hexToRgba(theme.colors.dark[9], 0.3)}, 0 6px 20px 0 ${hexToRgba(theme.colors[theme.primaryColor][6], 0.3)}`,
        borderWidth: '1px',
        borderColor: 'rgba(255,255,255,0.1)' ,
      }}>Save Changes</Button>
    </div>
  );
};

export default SimpleConfigSection;
