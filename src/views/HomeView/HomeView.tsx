// HomeView.tsx

import { Space } from '@mantine/core';
import GameLauncherCard from '../../components/GameLauncher/GameLauncher'; 
import Injector from '../../components/Injector/Injector';

const HomeView = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <div>
        <GameLauncherCard />
      </div>
      <Space h="md" />

      <Injector />
    </div>
  );
};

export default HomeView;


  
