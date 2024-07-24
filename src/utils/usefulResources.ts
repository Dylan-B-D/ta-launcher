import { FaDiscord, FaGithub } from 'react-icons/fa';
import { CgWebsite } from 'react-icons/cg';

export const resources = [
    {
      title: "Tribes Ascend Community Hub",
      description: "Active North American Discord Server, used for Mixers and PUGs.",
      link: "https://discord.com/invite/dd8JgzJ",
      icon: FaDiscord,
      gradient: { deg: 135, from: 'cyan', to: 'blue' },
    },
    {
      title: "EU GOTY Community",
      description: "Inactive EU Discord Server, used for PUGs.",
      link: "https://discord.com/invite/e7T8Pxs",
      icon: FaDiscord,
      gradient: { deg: 135, from: 'gray', to: 'darkgray' },
    },
    {
      title: "TAServer Discord",
      description: "Griffon's Discord, used for the community login server, and server hosting.",
      link: "https://discord.com/invite/8enekHQ",
      icon: FaDiscord,
      gradient: { deg: 135, from: 'teal', to: 'green' },
    },
    {
      title: "TAMods",
      description: "Info about TAMods, and guides on writing hud modules and scripts.",
      link: "https://www.tamods.org/",
      icon: CgWebsite,
      gradient: { deg: 135, from: 'blue', to: 'indigo' },
    },
    {
      title: "Dodge's Domain",
      description: "Additional information on game setup, and resources for community map development",
      link: "https://www.dodgesdomain.com/",
      icon: CgWebsite,
      gradient: { deg: 135, from: 'green', to: 'lime' },
    },
    {
      title: "TA Server GitHub",
      description: "Host Your Own Servers",
      link: "https://github.com/Griffon26/taserver/",
      icon: FaGithub,
      gradient: { deg: 135, from: 'red', to: 'orange' },
    },
  ];