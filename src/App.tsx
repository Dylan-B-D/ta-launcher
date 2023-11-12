// App.tsx
import { AppShell, Burger, Code, MantineProvider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { darkTheme } from './theme';
import "@mantine/core/styles.css";
import { NavbarNested } from './components/NavbarNested/NavbarNested';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomeView from './views/HomeView/HomeView';
import ServerBrowser from './views/ServerBrowserView/ServerBrowserView';
import React from 'react';
import { BiHomeAlt2 } from 'react-icons/bi';
import { RiSettingsLine } from 'react-icons/ri';
import { BiServer } from 'react-icons/bi';
import { GiLevelFourAdvanced } from 'react-icons/gi';
import { TiSpanner } from 'react-icons/ti';
import { CiRoute } from 'react-icons/ci';
import { LuPackage } from 'react-icons/lu';

interface View {
  component: React.ComponentType; // or React.ReactNode depending on how you use it
  path: string;
  name: string;
  icon: React.ComponentType; // assuming icons are React components
}


function App() {
  const [opened, { toggle }] = useDisclosure();

  // left sidebar
  const views: View[] = [
    { component: HomeView, path: '/home', name: 'Home' , icon: BiHomeAlt2},
    { component: ServerBrowser, path: '/setup', name: 'Setup', icon: RiSettingsLine, },
    { component: ServerBrowser, path: '/servers', name: 'Servers', icon: BiServer, },
    { component: ServerBrowser, path: '/advanced', name: 'Advanced', icon: GiLevelFourAdvanced, },
    { component: ServerBrowser, path: '/config', name: 'Config', icon: TiSpanner, },
    { component: ServerBrowser, path: '/routes', name: 'Routes', icon: CiRoute, },
    { component: ServerBrowser, path: '/packages', name: 'Packages', icon: LuPackage, },
  ];  

  const theme = darkTheme;

  return (
    <Router>
      <MantineProvider theme={darkTheme}>
      <AppShell
      header={{ height: 30 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colors.mutedBlue[0], // or any other shade
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
            backgroundColor: theme.colors.darkGray[3],
            borderBottomColor: theme.colors.darkGray[0],
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
          },
        })}
      >
      <div className="flex justify-between items-center">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="gray" />
        <div className="flex-1"></div> {/* Invisible spacer */}
        <div className="flex items-center pr-4 text-gray-400"> {/* Adjusted for vertical centering */}
            <Code style={{ marginTop: '4px' }} color={theme.colors?.mutedBlue?.[5] || 'defaultColor'}>
              Players Online: <strong>0</strong>
            </Code>
        </div>
      </div>



      </AppShell.Header>

      <AppShell.Navbar
        styles={(theme) => ({
          navbar: {
            backgroundColor: theme.colors.darkGray[2],
            borderRightColor: theme.colors.darkGray[6], 
            borderRightWidth: '1px',
            borderRightStyle: 'solid',
          },
        })}
       >
        <NavbarNested views={views} />
      </AppShell.Navbar>


      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Navigate to={views[0].path} />} />
          {views.map((view, index) => (
            <Route key={index} path={view.path} element={React.createElement(view.component)} />
          ))}
        </Routes>
      </AppShell.Main>

    </AppShell>
    </MantineProvider>
    </Router>
    
  );
}

export default App;
