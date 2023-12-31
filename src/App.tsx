// App.tsx

// Routing
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';
import { views } from './Routes/routes';
import { Notifications } from '@mantine/notifications';

// UI components and hooks
import { AppShell, MantineProvider } from '@mantine/core';

// Styling
import "@mantine/core/styles.css";
import createAppTheme from './theme';
import { NavbarNested } from './components/NavbarNested';
import { appWindow, PhysicalSize } from '@tauri-apps/api/window';
import HeaderComponent from './components/Header';
import classes from './styles.module.css';


async function setMinWindowSize() {
  await appWindow.setMinSize(new PhysicalSize(570, 330));
}


function App() {
  const theme = createAppTheme();
  setMinWindowSize();

  return (
    <Router>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications className={classes.mantineNotificationsContainer} />
        <AppShell header={{ height: 30 }} navbar={{ width: 220, breakpoint: 'none' }} padding="md">
          <HeaderComponent />
          <NavbarNested views={views} />
          <AppShell.Main style={{marginLeft: '16px'}}>
            <AppRoutes />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </Router>
  );
}

export default App;
