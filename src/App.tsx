// App.tsx
import { AppShell, Burger, MantineProvider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { darkTheme } from './theme';
import ColorBox from './components/ColorBox'; // Import the new component
import GameLauncherCard from './components/GameLauncher';
import Injector from './components/Injector';
import "@mantine/core/styles.css";

function App() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineProvider theme={darkTheme}>
      <AppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colors.mutedBlue[1], // or any other shade
          display: 'flex',
          flexDirection: 'column',
          height: '100vh', // full height
          width: '100vw', // full height
          borderStyle: 'none',
        },
      })}
      
    >
      <AppShell.Header
        styles={(theme) => ({
          header: {
            backgroundColor: theme.colors.mutedRed[1], // or any other shade
            borderBottomColor: theme.colors.mutedRed[4], // Set bottom border color
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
          },
        })}
      >
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar
        styles={(theme) => ({
          navbar: {
            backgroundColor: theme.colors.mutedGreen[1], // or any other shade
            borderRightColor: theme.colors.mutedGreen[4], // Set right border color
            borderRightWidth: '1px',
            borderRightStyle: 'solid',
          },
        })}
      >
        Navbar
      </AppShell.Navbar>


      <AppShell.Main>
      <div style={{ padding: '1rem' }}>
        <ColorBox />
        <GameLauncherCard />
        <Injector />
      </div>
      </AppShell.Main>
    </AppShell>
    </MantineProvider>
  );
}

export default App;
