// Injector.tsx

import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';
import { Button, Text, useMantineTheme, Code, Space, Paper } from '@mantine/core';
import { BsFileEarmarkCodeFill } from'react-icons/bs';
import { FaSyringe } from'react-icons/fa6';
import { hexToRgba } from '../../utils.ts';
import classes from '../../styles.module.css';

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
    <Paper style={{
      border: `${theme.colors.dark[4]} 1px solid`,
      background: hexToRgba(theme.colors.dark[4], 0.2),
      padding: '10px',
    }}>
      <Text  size="lg" style={{ textAlign: 'center', marginBottom: '1rem'}}>
        DLL Injector
      </Text>

      <Button.Group style={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          className={classes.buttonHoverEffect}
          onClick={openFile}
        >
          <BsFileEarmarkCodeFill style={{ marginRight: '0.5rem' }} />
          {getDll()}
        </Button>

        <Button 
          className={classes.buttonHoverEffect}
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
    </Paper>
  );
};

export default Injector;