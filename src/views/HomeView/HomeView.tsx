// HomeView.tsx

import ColorBox from '../../components/ColorBox';
import GameLauncherCard from '../../components/GameLauncher'; 
import Injector from '../../components/Injector';

const HomeView = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <ColorBox />
      <GameLauncherCard />
      <Injector />
    </div>
  );
};

export default HomeView;
