// Injector.tsx

import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';
import { Card, Button, Text, useMantineTheme, Code, Space } from '@mantine/core';
import { BsFileEarmarkCodeFill } from'react-icons/bs';
import { FaSyringe } from'react-icons/fa6';
import classes from './Injector.module.css';

const Injector: React.FC = () => {
  const [dll, setDll] = useState<string>("");
  const processName = 'TribesAscend.exe';
  const [isInjected, setIsInjected] = useState<boolean>(false);
  const [injectionStatus, setInjectionStatus] = useState<string>("");

  const theme = useMantineTheme();

  const openFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'DLLs', extensions: ['dll'] }],
    });

    if (selected) {
      setDll(selected as string);
    }
  };

  const getDll = (): string => {
    return dll === "" ? "No dll selected" : "Selected: " + dll.split("\\").pop();
  };

  const inject = async () => {
    try {
      const res = await invoke('inject', {
        process: processName,
        dllPath: dll
      });
      console.log(res);
      setIsInjected(true);
      setInjectionStatus("Injection Successful");
    } catch (error) {
      console.error(error);
      setIsInjected(false);
      setInjectionStatus(`Unable to inject: ${error}`);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="sm" style={{ backgroundColor: '#2C3E50', maxWidth: '350px', margin: 'auto' }}>
      <Text className={classes.title} size="lg" style={{ textAlign: 'center', marginBottom: '1rem', color: theme.colors.lightGray[4]}}>
        DLL Injector
      </Text>

      <Button.Group style={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          className={classes.customButton}
          style={{ backgroundColor: theme.colors.mutedBlue[8], color: theme.colors.darkGray[3] }}
          onClick={openFile}
        >
          <BsFileEarmarkCodeFill style={{ marginRight: '0.5rem' }} />
          {getDll()}
        </Button>

        <Button 
          className={classes.customButton}
          style={{ backgroundColor: theme.colors.mutedBlue[8], color: theme.colors.darkGray[3] }}
          onClick={inject}
          disabled={isInjected}
        >
          <FaSyringe style={{ marginRight: '0.5rem' }} />
          {isInjected ? 'Injected' : 'Inject'}
        </Button>
      </Button.Group>
      <Space h="md" />
      {injectionStatus && (
        <>
        <Code style={{
          marginTop: '4px',
          color: theme.colors?.lightGray?.[5] || '#B0B0B0' // Example light gray color
        }} color={theme.colors?.darkGray?.[2] || 'defaultColor'}>
            {injectionStatus}
          </Code></>
      )}
    </Card>
  );
};

export default Injector;