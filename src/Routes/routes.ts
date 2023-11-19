import { BiHomeAlt2, BiServer } from 'react-icons/bi';
import HomeView from '../views/HomeView';
import PackagesView from '../views/PackagesView';
import { LuPackage } from 'react-icons/lu';
import { IoGitNetworkSharp } from 'react-icons/io5';
import SettingsView from '../views/SettingsView';
import { TiCog, TiSpanner } from 'react-icons/ti';
import { CiRoute } from 'react-icons/ci';
import { AiOutlineUser } from 'react-icons/ai';
import { FaMicrochip } from "react-icons/fa6";

import ServerBrowser from '../views/ServerBrowserView';
import ConfigView from '../views/ConfigView';
import RoutesView from '../views/RoutesView';
import LoginView from '../views/LoginView';


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
    { component: PackagesView, path: '/packages', name: 'Packages', icon: LuPackage, },
    {
      name: 'Servers',
      icon: BiServer,
      subViews: [
        { name: 'PUG', path: '/servers/pug', component: ServerBrowser, icon: IoGitNetworkSharp },
        { name: 'Community', path: '/servers/community', component: ServerBrowser, icon: IoGitNetworkSharp },
      ]
    },
    {
      name: 'Advanced',
      icon: FaMicrochip,
      subViews: [
        { name: 'Config', path: '/advanced/config', component: ConfigView, icon: TiSpanner },
        { name: 'Routes', path: '/advanced/routes', component: RoutesView, icon: CiRoute },
      ]
    },
    { component: SettingsView, path: '/settings', name: 'Settings', icon: TiCog, },
    { component: LoginView, path: '/Login', name: 'Login', icon: AiOutlineUser, },
  ];