import { Button, Group, Center, Container, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const links = [
  { link: '/', label: 'Home' },
  { link: '/package-manager', label: 'Packages' },
  {
    link: '#more',
    label: 'More',
    links: [
      { link: '/config', label: 'Config' },
      { link: '/route-manager', label: 'Routes' },
      { link: '/resources', label: 'Resources' },
    ],
  },
  { link: '/settings', label: '⚙' },
];

export function Header() {
  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link} component={Link} to={item.link}>
        {item.label}
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <Button variant="subtle" color='white' component="a" href={link.link} onClick={(event) => event.preventDefault()}>
              <Center>
                <span>{link.label}</span>
                <IconChevronDown size="0.9rem" stroke={1.5} />
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
        color='white'
      >
        {link.label}
      </Button>
    );
  });

  return (
    <Container h={40} w={'100%'} bg={'gray'}>
      <Group gap="0" justify="center">
        {items}
      </Group>
    </Container>
  );
}
