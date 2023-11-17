// App.tsx

// Routing
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';
import { views } from './Routes/routes';

// UI components and hooks
import { AppShell, MantineProvider } from '@mantine/core';

// Styling
import "@mantine/core/styles.css";
import createAppTheme from './theme';
import { NavbarNested } from './components/NavbarNested/NavbarNested';
import { appWindow, PhysicalSize } from '@tauri-apps/api/window';
import HeaderComponent from './components/Header/Header';


async function setMinWindowSize() {
  await appWindow.setMinSize(new PhysicalSize(600, 500));
}


function App() {
  const theme = createAppTheme();
  setMinWindowSize();

  return (
    <Router>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AppShell header={{ height: 30 }} navbar={{ width: 220, breakpoint: 'none' }} padding="md">
          <HeaderComponent />
          <AppShell.Navbar>
            <NavbarNested views={views} />
          </AppShell.Navbar>
          <AppShell.Main>
            <AppRoutes />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </Router>
  );
}

export default App;
