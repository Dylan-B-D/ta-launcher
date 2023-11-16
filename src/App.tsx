// App.tsx

// Routing
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { views } from './routes';

// UI components and hooks
import { AppShell, MantineProvider } from '@mantine/core';

// Styling
import "@mantine/core/styles.css";
import createAppTheme from './theme';
import { NavbarNested } from './components/NavbarNested/NavbarNested';
import { appWindow, PhysicalSize } from '@tauri-apps/api/window';
import HeaderComponent from './components/Header/Header';
import { useThemeContext } from './context/ThemeContext';

await appWindow.setMinSize(new PhysicalSize(600, 550));


function App() {
  const { primaryColor, secondaryColor, tertiaryColor, primaryFontFamily, secondaryFontFamily } = useThemeContext();
  const theme = createAppTheme(primaryColor, secondaryColor, tertiaryColor, primaryFontFamily, secondaryFontFamily);


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
