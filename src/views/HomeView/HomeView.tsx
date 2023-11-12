// HomeView.tsx

import GameLauncherCard from '../../components/GameLauncher/GameLauncher'; 
import Injector from '../../components/Injector';

const HomeView = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <GameLauncherCard />
      <Injector />
    </div>
  );
};

export default HomeView;
