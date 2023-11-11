// GameLauncher.tsx

import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';

const GameLauncher: React.FC = () => {
  const startGame = async () => {
    try {
      await invoke("launch_game");
      console.log("Tribes Ascend launched successfully");
    } catch (error) {
      console.error("Failed to launch Tribes Ascend", error);
    }
  };

  return (
    <button onClick={startGame}>Launch Tribes Ascend</button>
  );
};

export default GameLauncher;
