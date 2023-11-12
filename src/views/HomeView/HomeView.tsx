// HomeView.tsx

import GameLauncherCard from '../../components/GameLauncher/GameLauncher'; 
import Injector from '../../components/Injector/Injector';
import classes from './HomeView.module.css';

const HomeView = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <div className={classes.cardWrapper}>
        <GameLauncherCard />
      </div>
      <Injector />
    </div>
  );
};

export default HomeView;

  
