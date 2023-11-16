import { BiHomeAlt2, BiServer } from 'react-icons/bi';
import HomeView from './views/HomeView/HomeView';
import PackagesView from './views/Packages/PackagesView';
import SetupView from './views/Setup/SetupView';
import { RiSettingsLine } from 'react-icons/ri';
import { LuPackage } from 'react-icons/lu';
import { IoGitNetworkSharp } from 'react-icons/io5';
import { GiLevelFourAdvanced } from 'react-icons/gi';
import SettingsView from './views/Settings/SettingsView';
import { TiCog, TiSpanner } from 'react-icons/ti';
import { CiRoute } from 'react-icons/ci';
import { AiOutlineUser } from 'react-icons/ai';
import ServerBrowser from './views/ServerBrowserView/ServerBrowserView';


export interface View {
    component?: React.ComponentType;
    path?: string;
    name: string;
    icon?: React.ComponentType;
    subViews?: View[];
    isOpen?: boolean;
  }

export const views: View[] = [
    { component: HomeView, path: '/home', name: 'Home', icon: BiHomeAlt2 },
    { component: SetupView, path: '/setup', name: 'Setup', icon: RiSettingsLine, },
    { component: PackagesView, path: '/packages', name: 'Packages', icon: LuPackage, },
    {
      name: 'Servers',
      icon: BiServer,
      subViews: [
        { name: 'PUG', path: '/servers/pug', component: HomeView, icon: IoGitNetworkSharp },
        { name: 'Community', path: '/servers/community', component: ServerBrowser, icon: IoGitNetworkSharp },
      ]
    },
    {
      name: 'Advanced',
      icon: GiLevelFourAdvanced,
      subViews: [
        { name: 'Config', path: '/advanced/config', component: HomeView, icon: TiSpanner },
        { name: 'Routes', path: '/advanced/routes', component: ServerBrowser, icon: CiRoute },
      ]
    },
    { component: SettingsView, path: '/settings', name: 'Settings', icon: TiCog, },
    { component: ServerBrowser, path: '/Login', name: 'Login', icon: AiOutlineUser, },
  ];