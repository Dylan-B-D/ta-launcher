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
      
      <div className={classes.bridge}></div> {/* Visual bridge element */}

      <Injector />
    </div>
  );
};

export default HomeView;


  
