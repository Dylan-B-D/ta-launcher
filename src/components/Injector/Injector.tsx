// Injector.tsx

import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { path } from '@tauri-apps/api';
import { readDir } from '@tauri-apps/api/fs';

import { Button } from '@mantine/core';
import { FaSyringe } from 'react-icons/fa6';

import classes from '../../styles.module.css';
import { notifications } from '@mantine/notifications';
import { useSettingsContext } from '../../context/SettingsContext';

const Injector: React.FC = () => {
  const { manualInjection } = useSettingsContext();
  const defaultDllPath = 'C:\\Users\\{username}\\Documents\\My Games\\Tribes Ascend\\TribesGame\\TALauncher\\TAMods.dll';
  const [dll, setDll] = useState<string>(defaultDllPath);
  const processName = 'TribesAscend.exe';
  const [isInjected, setIsInjected] = useState<boolean>(false);
  const [, setInjectionStatus] = useState<string>("");
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
      notifications.show({ title: 'Success', message: 'Injection Successful', color: 'green' });
    } catch (error) {
      console.error(error);
      setIsInjected(false);
      notifications.show({ title: 'Failed', message: `Unable to inject: ${error}`, color: 'red' });
    }
  };

  const isProcessRunning = async (processName: string) => {
    try {
      const res = await invoke('is_process_running', { processName });
      return res;
    } catch (error) {
      console.error('Error checking process status:', error);
      return false;
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const running = await isProcessRunning(processName);
      console.log(`Process running: ${running}`); // Add this line for debugging
      if (!running && isInjected) {
        setIsInjected(false);
        setInjectionStatus('');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isInjected, processName]);

  if (!manualInjection) {
    return null; // Don't render anything if manual injection is disabled
  }

  return (
    <Button
      className={classes.buttonHoverEffect}
      onClick={inject}
      disabled={isInjected || isFileMissing}
      h={50}
    >
      {isFileMissing ? 'Please download TAMods Core package' : (isInjected ? 'Injected' : 'Inject')}
      <FaSyringe style={{ marginLeft: '0.5rem' }} />
    </Button>
  );
};

export default Injector;