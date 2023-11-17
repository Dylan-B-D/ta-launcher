// Injector.tsx

import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { path } from '@tauri-apps/api';
import { readDir } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';
import { Button, Text, useMantineTheme, Code, Space, Paper } from '@mantine/core';
import { FaSyringe } from'react-icons/fa6';
import { hexToRgba } from '../../utils.ts';
import classes from '../../styles.module.css';

const Injector: React.FC = () => {
  const theme = useMantineTheme();
  const defaultDllPath = 'C:\\Users\\{username}\\Documents\\My Games\\Tribes Ascend\\TribesGame\\TALauncher\\TAMods.dll';
  const [dll, setDll] = useState<string>(defaultDllPath);
  const processName = 'TribesAscend.exe';
  const [isInjected, setIsInjected] = useState<boolean>(false);
  const [injectionStatus, setInjectionStatus] = useState<string>("");
  const [isFileMissing, setIsFileMissing] = useState<boolean>(false);

  const getUserDocumentsPath = async () => {
    const homeDir = await path.homeDir();
    return `${homeDir}\\Documents\\My Games\\Tribes Ascend\\TribesGame\\TALauncher`;
  };

  useEffect(() => {
    const checkDefaultDll = async () => {
      try {
        const documentsPath = await getUserDocumentsPath();
        const files = await readDir(documentsPath);
        const dllExists = files.some(file => file.name === 'TAMods.dll');
        setIsFileMissing(!dllExists);
        if (dllExists) {
          setDll(`${documentsPath}\\TAMods.dll`);
        }
      } catch (error) {
        console.error('Error reading directory:', error);
        setIsFileMissing(true);
      }
    };
  
    checkDefaultDll();
  }, []);

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
  
  const isProcessRunning = async (processName: string) => {
    try {
      const res = await invoke('is_process_running', { processName });
      return res; // Assuming the 'is_process_running' command returns a boolean
    } catch (error) {
      console.error('Error checking process status:', error);
      return false;
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const running = await isProcessRunning(processName);
      if (!running && isInjected) {
        setIsInjected(false);
        setInjectionStatus('');
      }
    }, 5000);
  
    return () => clearInterval(interval);
  }, [isInjected, processName]);
  

  return (
    <Paper style={{
      border: `${theme.colors.dark[4]} 1px solid`,
      background: hexToRgba(theme.colors.dark[4], 0.2),
      padding: '10px',
    }}>
      <Text  size="lg" style={{ textAlign: 'center', marginBottom: '1rem'}}>
        DLL Injector
      </Text>

      <Button 
        className={classes.buttonHoverEffect}
        onClick={inject}
        disabled={isInjected || isFileMissing}
      >
        <FaSyringe style={{ marginRight: '0.5rem' }} />
        {isFileMissing ? 'Please download TAMods Core package' : (isInjected ? 'Injected' : 'Inject')}
      </Button>
      <Space h="md" />
      {injectionStatus && (
        <>
        <Code style={{
          marginTop: '4px',
          color: theme.colors?.lightGray?.[5] || '#B0B0B0'
        }} color={theme.colors?.darkGray?.[2] || 'defaultColor'}>
            {injectionStatus}
          </Code></>
      )}
    </Paper>
  );
};

export default Injector;