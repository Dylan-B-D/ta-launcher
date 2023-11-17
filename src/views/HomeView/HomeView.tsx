// HomeView.tsx

import { Paper } from '@mantine/core';
import GameLauncherCard from '../../components/GameLauncher/GameLauncher'; 


const HomeView = () => {
  return (
    <Paper withBorder style={{ padding: '0.75rem' }}>
      <GameLauncherCard />
    </Paper>
  );
};

export default HomeView;


