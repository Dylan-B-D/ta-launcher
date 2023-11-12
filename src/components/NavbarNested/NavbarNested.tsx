// NavbarNested.tsx

import { Group, Code, ScrollArea, rem, useMantineTheme } from '@mantine/core';
import classes from './NavbarNested.module.css';
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import { PiCaretRightBold, PiCaretUpBold } from'react-icons/pi';

interface View {
  component?: React.ComponentType;
  path?: string;
  name: string;
  icon?: React.ComponentType;
  subViews?: View[];
  isOpen?: boolean; 
}


interface NavbarNestedProps {
  views: View[];
}

export function NavbarNested({ views: initialViews }: NavbarNestedProps) {
  const theme = useMantineTheme();
  const [views, setViews] = useState(initialViews);

  const toggleSubViews = (name: string) => {
    const updatedViews = views.map(view => {
      if (view.name === name) {
        return { ...view, isOpen: !view.isOpen };
      }
      return view;
    });

    setViews(updatedViews);
  };

  const renderSubViews = (subViews: View[], isOpen: boolean) => {
    const maxHeight = isOpen ? `${subViews.length * 50}px` : '0'; // Adjust 50px to your item height
    return (
      <div className={classes.subViewsContainer} style={{ maxHeight }}>
        {subViews.map(subView => renderLink(subView, true))}
      </div>
    );
  };

  const renderLink = (view: View, isSubView: boolean = false) => {
    // Check if the view is a parent item (has subViews and no path)
    const isParentItem = view.subViews && !view.path;
  
    return isParentItem ? (
      <div
        key={view.name}
        onClick={() => toggleSubViews(view.name)}
        className={classes.linkText}
        style={{ paddingLeft: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}> {/* Flex container for icon and text */}
          <div className={classes.linkIcon}>
            {view.icon ? <view.icon /> : null}
          </div>
          <span>{view.name}</span>
        </div>
        {/* Optional: Add an icon to indicate expandable items */}
        {view.isOpen ? <PiCaretUpBold /> : <PiCaretRightBold />}
      </div>
    ) : (
      <NavLink
        to={view.path || '/fallback-path'}
        key={view.name}
        className={({ isActive }) =>
          isActive ? `${classes.linkText} ${classes.linkActive}` : classes.linkText
        }
        style={{ paddingLeft: isSubView ? '40px' : '20px' }}
      >
        <div className={classes.linkIcon}>
          {view.icon ? <view.icon /> : null}
        </div>
        <span>{view.name}</span>
      </NavLink>
    );
  };

  const links = views.map((view) => (
    <div key={view.name}>
      <div onClick={() => view.subViews && toggleSubViews(view.name)}>
        {renderLink(view)}
      </div>
      {view.subViews && renderSubViews(view.subViews, view.isOpen || false)}
    </div>
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