import { useState, useEffect } from "react";
import { Badge, Group, Tooltip } from "@mantine/core";
import DownloadProgressIndicator from "./DownloadProgressIndicator";
import { useDownloadContext } from "../contexts/DownloadContext";
import { listen } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api/core";

function Footer() {
  const { getQueue, packagesToUpdate, addToQueue } = useDownloadContext();
  const [playerData, setPlayerData] = useState({
    Community: { count: 0, names: [] },
    PUG: { count: 0, names: [] }
  });
  const [isGameRunning, setIsGameRunning] = useState(false);

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

  return (
    <Group p='md' justify="space-between" align="center" style={{ width: '100%' }}>
      <Group>
        {getQueue().length > 0 ? (
          <DownloadProgressIndicator />
        ) : (
          <>
            <Tooltip label={playerData.Community.names.join(", ") || "No players"} withArrow>
              <Badge variant="light" color="cyan" size="lg" radius="xs">
                Community: {playerData.Community.count}
              </Badge>
            </Tooltip>
            <Tooltip label={playerData.PUG.names.join(", ") || "No players"} withArrow>
              <Badge variant="light" color="cyan" size="lg" radius="xs">
                PUG: {playerData.PUG.count}
              </Badge>
            </Tooltip>
          </>
        )}
      </Group>
      <button
        className='glowing-btn'
        onClick={handleLaunchOrUpdate}
        disabled={isGameRunning}
        style={{ opacity: isGameRunning ? 0.5 : 1, cursor: isGameRunning ? 'not-allowed' : 'pointer' }}
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