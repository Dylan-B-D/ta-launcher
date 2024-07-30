import { IconType } from 'react-icons';
import { FaGithub } from 'react-icons/fa';
import { CardGradientProps } from '../interfaces';

interface Resource extends CardGradientProps {
  icon?: IconType;
  image?: string;
}

export const discordResources: Resource[] = [
  {
    title: "Tribes Ascend Community Hub",
    description: "Active North American Discord Server, used for Mixers and PUGs.",
    link: "https://discord.com/invite/dd8JgzJ",
    image: "/images/communityhub.png",
    gradient: { deg: 135, from: 'cyan', to: 'blue' },
  },
  {
    title: "EU GOTY Community",
    description: "Inactive EU Discord Server, used for PUGs.",
    link: "https://discord.com/invite/e7T8Pxs",
    image: "/images/gotycommunity.png",
    gradient: { deg: 135, from: 'gray', to: 'darkgray' },
  },
  {
    title: "TAServer Discord",
    description: "Griffon's Discord, used for the community login server, and server hosting.",
    link: "https://discord.com/invite/8enekHQ",
    image: "/images/taserver.png",
    gradient: { deg: 135, from: 'teal', to: 'green' },
  },
];

export const usefulResources: Resource[] = [
  {
    title: "Dodge's Domain",
    description: "Additional information on game setup, and resources for community map development",
    link: "https://www.dodgesdomain.com/",
    image: "/images/dodgesdomain.png",
    gradient: { deg: 135, from: 'green', to: 'lime' },
  },
  {
    title: "TAMods",
    description: "Info about TAMods, and guides on writing hud modules and scripts.",
    link: "https://www.tamods.org/",
    image: "/images/tamods.png",
    gradient: { deg: 135, from: 'blue', to: 'indigo' },
  },
  {
    title: "TA Server GitHub",
    description: "Host Your Own Servers",
    link: "https://github.com/Griffon26/taserver/blob/master/docs/user_manual/hosting_a_game_server.md",
    icon: FaGithub,
    gradient: { deg: 135, from: 'teal', to: 'cyan' },
  },
];