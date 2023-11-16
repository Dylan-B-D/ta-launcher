// App.tsx

// Routing
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { views } from './routes';

// Mantine UI components and hooks
import { AppShell, createTheme, MantineProvider, MantineTheme } from '@mantine/core';

// Styling
import "@mantine/core/styles.css";
import { darkTheme } from './theme';
import { NavbarNested } from './components/NavbarNested/NavbarNested';
import { appWindow, PhysicalSize } from '@tauri-apps/api/window';
import HeaderComponent from './components/Header/Header';

await appWindow.setMinSize(new PhysicalSize(600, 550));

declare module '@mantine/core' {
  interface MantineTheme {
    secondaryColor: string;
    highlightColor: string;
  }
}
function App() {
  const theme = createTheme({
    fontFamily: 'Nunito Sans',
    colors: {
      mutedBlue: [
        "#2C3E50",
        "#34495E",
        "#3B546B",
        "#425F79",
        "#4A6A86",
        "#527594",
        "#5A80A1",
        "#628BAF",
        "#6A96BC",
        "#729FCA",
      ],
      mutedAmber: [
        "#50392C", // Dark, rich amber
        "#6C4F3D", // Dark muted amber
        "#876452", // Deep muted amber
        "#A27A68", // Rich muted amber
        "#BD8F7D", // Mid-tone muted amber
        "#D8A593", // Neutral muted amber
        "#F3BCA8", // Light muted amber
        "#FFD2BE", // Very light muted amber
        "#FFE8D4", // Pale muted amber
        "#FFF3E9", // Almost white amber
      ],
      mutedRed: [
        "#542424",
        "#633030",
        "#723C3C",
        "#814848",
        "#905454",
        "#9F6060",
        "#AE6C6C",
        "#BD7878",
        "#CC8484",
        "#DB9090",
      ],
    },
    primaryColor: 'mutedBlue',
    secondaryColor: 'mutedAmber',
    highlightColor: 'mutedRed',
    components: {
      Button: {
        styles: (theme: MantineTheme) => ({
          root: {
            color: theme.colors[theme.primaryColor][5],
            backgroundColor: theme.colors[theme.secondaryColor][5],
            borderColor: theme.colors[theme.highlightColor][5],
          },
        }),
      },
    },
  });

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
