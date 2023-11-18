// Injector.tsx

import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { path } from '@tauri-apps/api';
import { readDir } from '@tauri-apps/api/fs';
import { listen } from '@tauri-apps/api/event';

import { Button } from '@mantine/core';
import { FaSyringe } from 'react-icons/fa6';

import classes from '../styles.module.css';
import { notifications } from '@mantine/notifications';
import { useSettingsContext } from '../context/SettingsContext';

const Injector: React.FC = () => {
  const { manualInjection } = useSettingsContext();
  const defaultDllPath = '';
  const processName = 'TribesAscend.exe';
  const [isInjected, setIsInjected] = useState<boolean>(false);
  const [, setInjectionStatus] = useState<string>("");
  const [isFileMissing, setIsFileMissing] = useState<boolean>(false);
  const [processPID, setProcessPID] = useState<number | null>(null);


  const getInitialDllPath = async () => {
    try {
      const homeDir = await path.homeDir();
      const documentsPath = `${homeDir}\\Documents\\My Games\\Tribes Ascend\\TribesGame\\TALauncher`;
      const files = await readDir(documentsPath);
      const dllExists = files.some(file => file.name === 'TAMods.dll');
      setIsFileMissing(!dllExists);
      return dllExists ? `${documentsPath}\\TAMods.dll` : defaultDllPath;
    } catch (error) {
      console.error('Error accessing DLL path:', error);
      setIsFileMissing(true);
      return defaultDllPath;
    }
  };

  const [dll, setDll] = useState<string>('');

  useEffect(() => {
    getInitialDllPath().then(setDll);
  }, []);

  useEffect(() => {
    let unlisten: Promise<any>;
  
    if (!manualInjection) {
      unlisten = listen('dll-injection-trigger', () => {
        console.log("Auto-injecting with DLL path:", dll);
        inject();
      });
    }
  
    return () => {
      if (unlisten) {
        unlisten.then(unsubscribe => unsubscribe());
      }
    };
  }, [dll, manualInjection]);

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

  

  useEffect(() => {
    const fetchProcessPID = async () => {
      try {
        // Explicitly cast the result of invoke to number or null
        const pid = await invoke('get_process_pid', { processName }) as number | null;
  
        setProcessPID(pid);
      } catch (error) {
        console.error('Error getting process PID:', error);
        setProcessPID(null);
      }
    };
  
    fetchProcessPID();
  }, [processName]);


  useEffect(() => {
    const interval = setInterval(async () => {
      if (processPID) {
        const running = await invoke('is_pid_running', { pid: processPID });
        if (!running) {
          setIsInjected(false);
          setInjectionStatus('');
          setProcessPID(null); // Reset PID when the process is no longer running
        }
      }
    }, 5000);
  
    return () => clearInterval(interval);
  }, [processPID]);

  if (!manualInjection) {
    return null;
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