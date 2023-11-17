// HomeView.tsx

import { Paper, Space } from '@mantine/core';
import GameLauncherCard from '../../components/GameLauncher/GameLauncher'; 
import Injector from '../../components/Injector/Injector';

const HomeView = () => {
  return (
    <Paper withBorder style={{ padding: '0.75rem' }}>
      <GameLauncherCard />
      <Space h="md" />
      <Injector />
    </Paper>
  );
};

export default HomeView;


