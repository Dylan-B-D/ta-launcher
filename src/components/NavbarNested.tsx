// NavbarNested.tsx

import { AppShell, ScrollArea, useMantineTheme } from '@mantine/core';
import classes from './NavbarNested.module.css';
import { NavLink } from 'react-router-dom';
import React, { useState } from 'react';
import { PiCaretRightBold, PiCaretUpBold } from 'react-icons/pi';
import { hexToRgba } from '../utils';

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

  const regularLinks = views.filter(view => view.name !== 'Login' && view.name !== 'Settings');
  const specialLinks = views.filter(view => view.name === 'Login' || view.name === 'Settings');

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
    const maxHeight = isOpen ? `${subViews.length * 50}px` : '0'; 
    const spaceStyle = isOpen ? { marginBottom: '12px' } : {}; 

    return (
      <div className={classes.subViewsContainer} style={{ ...spaceStyle, maxHeight }}>
        {subViews.map(subView => renderLink(subView, true))}
      </div>
    );
  };


  const renderLink = (view: View, isSubView: boolean = false) => {
    // Check if the view is a parent item (has subViews and no path)
    const isParentItem = view.subViews && !view.path;

    const linkStyle = (isActive: boolean) => ({
      paddingLeft: isSubView ? '48px' : '16px',
      cursor: 'pointer',
      color: theme.colors.gray[4],
      backgroundColor: isActive? theme.colors[theme.primaryColor][9] : 'transparent',
    });

    // Common icon rendering logic for both parent and sub-views
    const iconElement = view.icon ? (
      <div className={classes.linkIcon}>
        <view.icon />
      </div>
    ) : null;

    return isParentItem ? (
      <div
        key={view.name}
        onClick={() => toggleSubViews(view.name)}
        className={classes.linkText}
        style={{
          paddingLeft: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: theme.colors.gray[4]
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {iconElement}
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
        style={({ isActive }) => linkStyle(isActive)}>
        {iconElement}
        <span>{view.name}</span>
      </NavLink>
    );
  };

  const maxScrollHeight = 'calc(100vh - 60px)'; // This can probably be done better

  return (
    <AppShell.Navbar style={{
      background: `linear-gradient(180deg, ${theme.colors.dark[6]} 0%, ${theme.colors.dark[6]} 50%, ${theme.colors[theme.tertiaryColor][9]} 100%)`,
      margin: '16px 16px 0 16px',
      border: '1px solid',
      borderColor: theme.colors.dark[4],
      borderRadius: '8px',
      height: maxScrollHeight,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: `0 4px 8px 0 ${hexToRgba(theme.colors.dark[9], 1)}, 0 6px 20px 0 ${hexToRgba(theme.colors[theme.tertiaryColor][9], 0.3)}`,
    }}>
      <nav className={classes.navbar} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Scrollable Area for Regular Links */}
        <ScrollArea className={classes.links} scrollbarSize={2} style={{ overflowY: 'auto', flex: 1 }}>
          <div className={classes.linksInner}>
            {regularLinks.map(view => (
              <React.Fragment key={view.name}>
                <div onClick={() => view.subViews && toggleSubViews(view.name)}>
                  {renderLink(view)}
                </div>
                {view.subViews && renderSubViews(view.subViews, view.isOpen || false)}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>

        {/* Fixed Area for Special Links */}
        <div>
          {/* Divider */}
          <div className={classes.navDivider} style={{marginTop: '0px'}}></div>

          {specialLinks.map(view => (
            <div key={view.name} onClick={() => view.subViews && toggleSubViews(view.name)}>
              {renderLink(view)}
            </div>
          ))}
        </div>
      </nav>
    </AppShell.Navbar>
  );
}