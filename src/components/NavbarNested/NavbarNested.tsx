// NavbarNested.tsx

import { Group, Code, ScrollArea, rem, useMantineTheme } from '@mantine/core';
import classes from './NavbarNested.module.css';
import { NavLink } from 'react-router-dom';

interface View {
  component: React.ComponentType;
  path: string;
  name: string;
  icon: React.ComponentType;
}


interface NavbarNestedProps {
  views: View[];
}

export function NavbarNested({ views }: NavbarNestedProps) {
  const theme = useMantineTheme();

  const links = views.map((view) => (
    <NavLink
      to={view.path}
      key={view.name}
      className={({ isActive }) =>
        isActive ? `${classes.linkText} ${classes.linkActive}` : classes.linkText
      }
    >
      <div className={classes.linkIcon}>
        <view.icon />
      </div>
      <span>{view.name}</span>
    </NavLink>
  ));
  

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <span className={classes.name} style={{ fontSize: rem(24), fontWeight: 'bold', color: 'rgba(255,255,255,0.8)' }}>TALauncher</span>
          <Code fw={700} color={theme.colors.mutedBlue[5]}>v0.0.1</Code>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>
    </nav>
  );
}