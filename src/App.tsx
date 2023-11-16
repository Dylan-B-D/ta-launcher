// App.tsx

// Routing
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { views } from './routes';

// Mantine UI components and hooks
import { AppShell, MantineProvider, useMantineColorScheme } from '@mantine/core';

// Styling
import "@mantine/core/styles.css";
import { darkTheme } from './theme';
import { NavbarNested } from './components/NavbarNested/NavbarNested';
import { appWindow, PhysicalSize } from '@tauri-apps/api/window';
import HeaderComponent from './components/Header/Header';

await appWindow.setMinSize(new PhysicalSize(600, 550));





function App() {
  return (
    <Router>
      <MantineProvider defaultColorScheme="dark" theme={{ fontFamily: 'Nunito Sans' }}>
        <AppShell header={{ height: 30 }} navbar={{ width: 220, breakpoint: 'none' }} padding="md">
          <HeaderComponent />
          <AppShell.Navbar>
            <NavbarNested views={views} />
          </AppShell.Navbar>
          <AppShell.Main>
            <AppRoutes /> {/* Use the AppRoutes component */}
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </Router>
  );
}

export default App;
