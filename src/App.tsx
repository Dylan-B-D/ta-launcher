// App.tsx

import './App.css';
import Injector from './components/Injector'; 
import GameLauncher from './components/GameLauncher';

function App() {
  return (
    <>
      <div>
      <GameLauncher />
        <Injector />
      </div>
    </>
  );
}

export default App;

