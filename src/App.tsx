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
import { IoGitNetworkSharp } from 'react-icons/io5';
import { TiCog } from 'react-icons/ti';
import { AiOutlineUser } from 'react-icons/ai';

interface View {
  component?: React.ComponentType;
  path?: string;
  name: string;
  icon?: React.ComponentType;
  subViews?: View[]; 
  isOpen?: boolean; 
}


function App() {
  const [opened, { toggle }] = useDisclosure();

  const renderRoutes = (view: View) => {
    let routes: any[] = [];

    // If the view has a component and path, add its route
    if (view.path && view.component) {
      routes.push(
        <Route key={view.path} path={view.path} element={React.createElement(view.component)} />
      );
    }

    // If the view has subViews, add routes for each
    if (view.subViews) {
      view.subViews.forEach(subView => {
        routes = routes.concat(renderRoutes(subView));
      });
    }

    return routes;
  };

  // left sidebar
  const views: View[] = [
    { component: HomeView, path: '/home', name: 'Home' , icon: BiHomeAlt2},
    { component: ServerBrowser, path: '/setup', name: 'Setup', icon: RiSettingsLine, },
    { component: ServerBrowser, path: '/packages', name: 'Packages', icon: LuPackage, },
    { 
      name: 'Servers', 
      icon: BiServer, 
      subViews: [
        { name: 'PUG', path: '/servers/pug', component: HomeView, icon: IoGitNetworkSharp},
        { name: 'Community', path: '/servers/community', component: ServerBrowser, icon: IoGitNetworkSharp },
      ] 
    },
    { 
      name: 'Advanced', 
      icon: GiLevelFourAdvanced, 
      subViews: [
        { name: 'Config', path: '/advanced/config', component: HomeView, icon: TiSpanner},
        { name: 'Routes', path: '/advanced/routes', component: ServerBrowser, icon: CiRoute },
      ] 
    },
    { component: ServerBrowser, path: '/settings', name: 'Settings', icon: TiCog, },
    { component: ServerBrowser, path: '/Login', name: 'Login', icon: AiOutlineUser, },
  ];  
  

  const theme = darkTheme;

  return (
    <Router>
      <MantineProvider theme={darkTheme}>
      <AppShell
      header={{ height: 30 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
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
          <Route path="/" element={<Navigate to={views[0].path || '/fallback-path'} />} />
          {views.flatMap(view => renderRoutes(view))}
        </Routes>
      </AppShell.Main>

    </AppShell>
    </MantineProvider>
    </Router>
    
  );
}

export default App;
