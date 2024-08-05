import { Button, Group, Center, Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { VscSettings } from "react-icons/vsc";

interface LinkItem {
  link: string;
  label: string;
  links?: LinkItem[];
}

const links: LinkItem[] = [
  { link: "/", label: "Home" },
  { link: "/package-manager", label: "Packages" },
  // {
  //   link: '#more',
  //   label: 'More',
  //   links: [
  //     { link: '/config', label: 'Config' },
  //     { link: '/route-manager', label: 'Routes' },
  //     { link: '/resources', label: 'Resources' },
  //   ],
  // },
  { link: "/config", label: "Config" },
  { link: "/route-manager", label: "Routes" },
  { link: "/resources", label: "Resources" },
];

const buttonColor = "rgba(255,255,255,0.8)";

export function Header() {
  const items = links.map((link: LinkItem) => {
    const menuItems = link.links?.map((item: LinkItem) => (
      <Menu.Item key={item.link} component={Link} to={item.link}>
        {item.label}
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <Button
              fw={200}
              style={{ letterSpacing: 1 }}
              variant="subtle"
              color={buttonColor}
              component="a"
              href={link.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span>{link.label}</span>
                <IconChevronDown
                  size="0.9rem"
                  stroke={2.5}
                  style={{ marginLeft: 8 }}
                />
              </Center>
            </Button>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Button
        key={link.label}
        component={Link}
        to={link.link}
        variant="subtle"
        color={buttonColor}
        fw={200}
        style={{ letterSpacing: 1 }}
      >
        {link.label}
      </Button>
    );
  });

  return (
    <Group p="0 2px" h={40} w={"100%"} gap="0" justify="space-between">
      <Group gap="0">{items}</Group>
      <Button
        component={Link}
        to="/settings"
        variant="subtle"
        color={buttonColor}
      >
        <VscSettings size={20} />
      </Button>
    </Group>
  );
}
