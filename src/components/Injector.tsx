// Injector.tsx

import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';

const Injector: React.FC = () => {
  const [dll, setDll] = useState<string>("");
  const [processName, setProcessName] = useState<string>("");
  const [isInjected, setIsInjected] = useState<boolean>(false);
  const [injectionStatus, setInjectionStatus] = useState<string>("");

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
    <div>
      <input
        className="w-full p-2 rounded bg-gray-700 border border-gray-600 mb-4"
        value={processName}
        onChange={e => setProcessName(e.target.value)}
        placeholder="Enter a process name"
        type="text"
      />
      <button 
        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded mb-2"
        type="button" 
        onClick={openFile}
      >
        {getDll()}
      </button>
      <button 
        className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded"
        type="button" 
        onClick={inject}
        disabled={isInjected}
      >
        {isInjected ? 'Injected' : 'Inject'}
      </button>
      {injectionStatus && (
        <p className="mt-4 text-red-500">{injectionStatus}</p>
      )}
    </div>
  );
};

export default Injector;
