import { useState, useEffect } from "react";
import { Badge, Group, Tooltip, TextInput, ActionIcon, Divider } from "@mantine/core";
import { FaSteam } from "react-icons/fa";
import { MdGames } from "react-icons/md";
import DownloadProgressIndicator from "./DownloadProgressIndicator";
import { useDownloadContext } from "../contexts/DownloadContext";
import { useConfig } from "../contexts/ConfigContext";
import { listen } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api/core";

function Footer() {
  const { getQueue, packagesToUpdate, addToQueue } = useDownloadContext();
  const { config, setConfig } = useConfig();
  const [playerData, setPlayerData] = useState({
    Community: { count: 0, names: [] },
    PUG: { count: 0, names: [] }
  });
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [customServerIP, setCustomServerIP] = useState(config.customServerIP || '');
  const [error, setError] = useState('');
  const queue = getQueue();
  const isDownloading = queue.length > 0;
  const isButtonDisabled = isGameRunning || isDownloading;

  useEffect(() => {
    async function fetchPlayerCounts() {
      console.log("Fetching player counts...");
      try {
        const result = await invoke("fetch_players_online");
        setPlayerData(result as { Community: { count: number; names: never[] }; PUG: { count: number; names: never[] } });
      } catch (error) {
        console.error("Failed to fetch player counts:", error);
      }
    }

    fetchPlayerCounts(); // Initial fetch

    const intervalId = setInterval(fetchPlayerCounts, 60000); // Fetch every 60 seconds

    const unlistenGameLaunched = listen('game-launched', () => {
      setIsGameRunning(true);
    });

    const unlistenGameExited = listen('game-exited', () => {
      setIsGameRunning(false);
    });

    return () => {
      clearInterval(intervalId);
      unlistenGameLaunched.then(unlisten => unlisten());
      unlistenGameExited.then(unlisten => unlisten());
    };
  }, []);

  const handleLaunchOrUpdate = async () => {
    if (packagesToUpdate.length > 0) {
      // Add packages to the update queue
      packagesToUpdate.forEach(packageId => addToQueue(packageId));
    } else {
      try {
        await invoke("launch_game");
      } catch (error) {
        console.error("Failed to launch game:", error);
      }
    }
  };

  const handleServerChange = (value: string) => {
    setConfig((prev) => ({ ...prev, loginServer: value }));
    if (value !== 'Custom') {
      setCustomServerIP(''); // Reset custom IP if another server is selected
      setError('');
    }
  };

  const handleCustomIPChange = (value: string) => {
    setCustomServerIP(value);
    setConfig((prev) => ({ ...prev, customServerIP: value }));
    if (value.trim()) {
      setError('');
    }
  };

  const handleBlur = () => {
    if (config.loginServer === 'Custom' && !customServerIP.trim()) {
      setError('Server IP cannot be blank');
    } else {
      setError('');
    }
  };

  useEffect(() => {
    // Update customServerIP state when config.customServerIP changes
    if (config.loginServer === 'Custom') {
      setCustomServerIP(config.customServerIP || '');
    } else {
      setCustomServerIP('');
    }
  }, [config.customServerIP, config.loginServer]);

  const toggleLaunchMethod = () => {
    setConfig((prev) => ({
      ...prev,
      launchMethod: prev.launchMethod === 'Steam' ? 'Non-Steam' : 'Steam'
    }));
  };

  return (
    <Group p='md' justify="space-between" align="center" style={{ width: '100%' }}>
      <Group>
        {isDownloading ? (
          <DownloadProgressIndicator />
        ) : (
          <Group style={{ gap: '4px' }}>
            <Tooltip label={playerData.Community.names.join(", ") || "No players"} withArrow>
              <Badge
                fw={500}
                variant={config.loginServer === 'Community' ? "filled" : "light"}
                color={config.loginServer === 'Community' ? "teal" : "gray"}
                size="lg"
                radius="xs"
                onClick={() => handleServerChange('Community')}
                style={{ cursor: 'pointer', userSelect: 'none', boxShadow: config.loginServer === 'Community' ? '0 4px 10px rgba(0, 128, 128, 0.5)' : 'none', }}
              >
                Community: {playerData.Community.count}
              </Badge>
            </Tooltip>
            <Tooltip label={playerData.PUG.names.join(", ") || "No players"} withArrow>
              <Badge
                fw={500}
                variant={config.loginServer === 'PUG' ? "filled" : "light"}
                color={config.loginServer === 'PUG' ? "teal" : "gray"}
                size="lg"
                radius="xs"
                onClick={() => handleServerChange('PUG')}
                style={{ cursor: 'pointer', userSelect: 'none', boxShadow: config.loginServer === 'PUG' ? '0 4px 10px rgba(0, 128, 128, 0.5)' : 'none', }}
              >
                PUG: {playerData.PUG.count}
              </Badge>
            </Tooltip>
            <Tooltip label="Select Custom Server" withArrow>
              <Badge
                fw={500}
                variant={config.loginServer === 'Custom' ? "filled" : "light"}
                color={config.loginServer === 'Custom' ? "teal" : "gray"}
                size="lg"
                radius="xs"
                onClick={() => handleServerChange('Custom')}
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  boxShadow: config.loginServer === 'Custom' ? '0 4px 10px rgba(0, 128, 128, 0.5)' : 'none',
                }}
              >
                Custom
              </Badge>

            </Tooltip>
            {config.loginServer === 'Custom' && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextInput
                  variant="filled"
                  size="26px"
                  radius="xs"
                  value={customServerIP}
                  onChange={(event) => handleCustomIPChange(event.currentTarget.value)}
                  placeholder="Enter custom IP"
                  error={!!error}
                  onBlur={handleBlur}
                  styles={{
                    input: { padding: '6px', maxWidth: '150px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                />

              </div>
            )}
            <Divider orientation="vertical" mx="4px" />
            <Tooltip label={`Current: ${config.launchMethod}`} withArrow>
              <ActionIcon size='26px' radius='xs' onClick={toggleLaunchMethod} variant="light" color="teal" style={{ boxShadow: '0 4px 10px rgba(0, 128, 128, 0.1)' }}>
                {config.launchMethod === 'Steam' ? <FaSteam size={20} /> : <MdGames size={20} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>
      <button
        className='glowing-btn'
        onClick={handleLaunchOrUpdate}
        disabled={isButtonDisabled}
        style={{ opacity: isGameRunning ? 0.5 : 1, cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }}
      >
        {packagesToUpdate.length > 0 ? (
          <span>UP<span className='faulty-letter'>D</span>ATE<sup><i style={{ letterSpacing: 2 }}>({packagesToUpdate.length})</i></sup></span>
        ) : isGameRunning ? (
          <span>LAUNCH</span>
        ) : (
          <span className='glowing-txt'>L<span className='faulty-letter'>A</span>UNCH</span>
        )}
      </button>
    </Group>
  );
}

export default Footer;
