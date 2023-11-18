// GameLauncher.tsx

import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Button, Text, Group, TextInput, Textarea, Collapse, Code, useMantineTheme, Space, Paper, Grid } from '@mantine/core';
import { FaCirclePlay, FaFolderOpen } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import { IoEye } from "react-icons/io5";
import { dialog } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { hexToRgba } from '../utils.ts';
import classes from '../styles.module.css';
import Injector from './Injector.tsx';

const GameLauncher: React.FC = () => {
  const theme = useMantineTheme();
  const [launchType, setLaunchType] = useState(localStorage.getItem('launchType') || 'Steam');
  const [loginServer, setLoginServer] = useState(localStorage.getItem('loginServer') || 'Community');
  const [exePath, setExePath] = useState(localStorage.getItem('exePath') || '');
  const [customServer, setCustomServer] = useState(localStorage.getItem('customServer') || '');
  const [isNonSteamOptionsOpen, setIsNonSteamOptionsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState('');
  const [isSearching, setIsSearching] = useState(false);


  useEffect(() => {
    const savedLaunchType = localStorage.getItem('launchType');
    const savedLoginServer = localStorage.getItem('loginServer');
    const savedExePath = localStorage.getItem('exePath');
    const savedCustomServer = localStorage.getItem('customServer');

    if (savedLaunchType) setLaunchType(savedLaunchType);
    if (savedLoginServer) setLoginServer(savedLoginServer);
    if (savedExePath) setExePath(savedExePath);
    if (savedCustomServer) setCustomServer(savedCustomServer);
  }, []);

  // Update local storage when states change
  useEffect(() => {
    localStorage.setItem('launchType', launchType);
    localStorage.setItem('loginServer', loginServer);
    localStorage.setItem('exePath', exePath);
    localStorage.setItem('customServer', customServer);
  }, [launchType, loginServer, exePath, customServer]);


  const startGame = async () => {
    try {
      let launchArg;
      if (loginServer === 'Custom' && customServer) {
        // Append '-hostx=' to the custom server IP
        launchArg = `-hostx=${customServer}`;
      } else {
        // For predefined servers, use their respective launch arguments
        switch (loginServer) {
          case 'Community':
            launchArg = '-hostx=ta.kfk4ever.com';
            break;
          case 'PUG':
            launchArg = '-hostx=Ta.dodgesdomain.com';
            break;
          default:
            launchArg = '';
        }
      }

      let options = {
        exePath,
        launchArg,
      };

      if (launchType === 'Steam') {
        // Call the Rust function for Steam
        await invoke("launch_game", { options });
        console.log("Tribes Ascend launched successfully with Steam options:", options);
      } else if (launchType === 'Non Steam') {
        // Call the Rust function for Non-Steam
        await invoke("launch_game_non_steam", { options });
        console.log("Tribes Ascend launched successfully with Non-Steam options:", options);
      }
    } catch (error) {
      console.error("Failed to launch Tribes Ascend", error);
    }
  };

  const handleSearchGame = async () => {
    setSearchError(null); // Reset the error message before searching
    setIsSearching(true);
    try {
      const filePath = await invoke("find_executable");
      if (typeof filePath === 'string' && filePath) {
        setExePath(filePath);
      } else {
        setSearchError("Game executable not found. Please install the game or select the executable manually.");
      }
    } catch (error) {
      console.error("Error searching for Tribes Ascend executable:", error);
      setSearchError("An error occurred during the search.");
    } finally {
      setIsSearching(false); // Stop searching
    }
  };


  const handleOpenFile = async () => {
    try {
      const selected = await dialog.open({
        filters: [{ name: 'Executable', extensions: ['exe'] }],
        multiple: false,
      });

      if (selected && typeof selected === 'string') {
        setExePath(selected);
      }
    } catch (error) {
      console.error("Error opening file chooser:", error);
    }
  };

  const buttonStyle = (selected: boolean) => ({
    color: selected ? theme.colors.gray[0] : theme.colors.dark[1],
    background: selected ? `linear-gradient(45deg, ${theme.colors.dark[3]} 0%, ${theme.colors[theme.primaryColor][3]} 100%)` : hexToRgba(theme.colors.dark[1], 0.1),
    borderWidth: '0px',
    borderColor: selected ? hexToRgba(theme.colors.dark[1], 0.2) : 'transparent',
  });

  useEffect(() => {
    // Automatically open advanced settings if Non Steam is selected and exePath is empty
    if (launchType === 'Non Steam' && !exePath) {
      setIsNonSteamOptionsOpen(true);
    }
  }, [launchType, exePath]);

  const toggleNonSteamOptions = () => {
    setIsNonSteamOptionsOpen(!isNonSteamOptionsOpen);
  };

  useEffect(() => {
    const unlisten = listen("search_progress", (event: { payload: any; }) => {
      setSearchProgress(event.payload); // Or update a state to show progress in the UI
    });

    return () => {
      unlisten.then((fn: () => any) => fn()); // Clean up the listener when the component unmounts
    };
  }, []);

  const gridColStyle = {
    transition: 'transform 0.3s ease',
    transformOrigin: 'center top',
  };

  return (
    <div>
      <Grid>
        {/* First Column */}
        <Grid.Col span={{ base: 12, md: 6 }} style={gridColStyle}>
          <Paper style={{
            border: `${theme.colors.dark[4]} 1px solid`,
            borderRadius: '8px',
            //background: hexToRgba(theme.colors.dark[4], 0.2),
            padding: '10px',
          }}>
            <Text
              size="sm"
              style={{
                fontWeight: 'bold',
              }}
            >Launch Type:</Text>
            <Space h="xs" />
            <Group style={{ width: '100%' }}>
              <Button.Group>
                <Button
                  className={classes.buttonHoverEffect}
                  onClick={() => setLaunchType('Steam')}
                  style={buttonStyle(launchType === 'Steam')}
                >
                  Steam
                </Button>
                <Button
                  className={classes.buttonHoverEffect}
                  onClick={() => setLaunchType('Non Steam')}
                  style={buttonStyle(launchType === 'Non Steam')}
                >
                  Non-Steam
                </Button>
              </Button.Group>
              {launchType === 'Non Steam' && (
                <Button onClick={toggleNonSteamOptions} className={classes.buttonHoverEffect}>
                  <IoEye size={16} />
                </Button>
              )}
            </Group>


            {launchType === 'Non Steam' && (
              <>

                <Collapse in={isNonSteamOptionsOpen}>
                  <Space h="xs" />
                  <Textarea
                    value={exePath}
                    onChange={(event) => setExePath(event.target.value)}
                    label="Tribes Ascend executable path"
                    placeholder="Path to executable"
                    error={!exePath && "Invalid Path"}
                    autosize
                    minRows={3}
                    maxRows={4}
                  />
                  <Space h="xs" />
                  <Group>
                    <Button onClick={handleOpenFile} className={classes.buttonHoverEffect}>
                      <span style={{ marginRight: '8px' }}>Open</span>
                      <FaFolderOpen />
                    </Button>
                    <Button onClick={handleSearchGame} className={classes.buttonHoverEffect}>
                      <span style={{ marginRight: '8px' }}>Search</span>
                      <FaSearch />
                    </Button>
                  </Group>
                  <Collapse in={isSearching}>
                    <Code>
                      Searching for game executable... {searchProgress}
                    </Code>
                  </Collapse>
                  {searchError && (
                    <Text>
                      {searchError}
                    </Text>
                  )}

                </Collapse>
              </>
            )}
          </Paper>
        </Grid.Col>
        <Space h="md" />
        <Grid.Col span={{ base: 12, md: 6 }} style={gridColStyle}>
          <Paper style={{
            border: `${theme.colors.dark[4]} 1px solid`,
            borderRadius: '8px',
            //background: hexToRgba(theme.colors.dark[4], 0.2),
            padding: '10px',
          }}>
            <Text
              size="sm"
              style={{
                fontWeight: 'bold',
              }}
            >
              Login Server:</Text>
            <Space h="xs" />
            <Button.Group>
              <Button
                onClick={() => setLoginServer('Community')}
                style={buttonStyle(loginServer === 'Community')}
                className={classes.buttonHoverEffect}
              >
                Community
              </Button>
              <Button
                onClick={() => setLoginServer('PUG')}
                style={buttonStyle(loginServer === 'PUG')}
                className={classes.buttonHoverEffect}
              >
                PUG
              </Button>
              <Button
                onClick={() => setLoginServer('Custom')}
                style={buttonStyle(loginServer === 'Custom')}
                className={classes.buttonHoverEffect}
              >
                Custom
              </Button>
            </Button.Group>

            {loginServer === 'Custom' && (
              <><Space h="xs" /><TextInput
                label="Custom Login Server"
                placeholder="Enter custom server"
                value={customServer}
                onChange={(event) => setCustomServer(event.currentTarget.value)} /></>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
      <Space h="md" />
      <Paper style={{
        borderRadius: '8px',
        border: `${theme.colors.dark[4]} 1px solid`,
        // background: hexToRgba(theme.colors.dark[4], 0.2),
        padding: '10px',
      }}>
        <Group>
          <Button
            onClick={startGame}
            h={50}
            style={{
              background: `linear-gradient(135deg, ${theme.colors[theme.primaryColor][9]} 0%, ${theme.colors.dark[7]} 100%)`,
              border: `${hexToRgba(theme.colors.dark[3], 0.8)} 1px solid`,
              flexGrow: 4, // Takes more space
            }}
            rightSection={<FaCirclePlay size={14} />}
            className={classes.buttonHoverEffect}
          >
            Launch Tribes Ascend
          </Button>
          <Injector /> {/* Takes less space */}
        </Group>
      </Paper>
    </div>
  );
};

export default GameLauncher;
