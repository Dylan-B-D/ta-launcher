import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/pages/Home";
import FirstTimeSetup from "./components/pages/FirstTimeSetup";
import { DownloadProvider } from "./contexts/DownloadContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { Button, Container, Group, Modal, Stack, Text } from "@mantine/core";

function App() {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [updateModalOpened, setUpdateModalOpened] = useState(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [updateBody, setUpdateBody] = useState<string | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();
      if (update?.available) {
        setUpdateVersion(update.version);
        setUpdateBody(update.body || "");
        // setUpdateModalOpened(true);
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const update = await check();
      if (update?.available) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  const handleCancelUpdate = () => {
    setUpdateModalOpened(false);
  };

  useEffect(() => {
    const firstTime = localStorage.getItem("isFirstTime");
    if (firstTime === "false") {
      setIsFirstTime(false);
    }
  }, []);

  const handleSetupComplete = () => {
    setIsFirstTime(false);
  };

  return (
    <ConfigProvider>
      <DownloadProvider>
        <Modal
          opened={updateModalOpened}
          onClose={handleCancelUpdate}
          centered
          withCloseButton={false}
        >
          <Container>
            <Stack gap="xs">
              <Text ta='center' size="lg" fw={500}>An update is available</Text>
              {updateVersion && (
                <Text c="dimmed"><strong>Version:</strong> {updateVersion}</Text>
              )}
              {updateBody && (
                <Text c="dimmed">
                  <strong>Patch Notes: </strong>
                  <br />
                  {updateBody}
                </Text>
              )}
            </Stack>
            <Group grow justify="center" mt="md">
              <Button color='teal' onClick={handleUpdate}>Update Now</Button>
              <Button color='orange' variant="outline" onClick={handleCancelUpdate}>Cancel</Button>
            </Group>
          </Container>
        </Modal>
        <Router>
          <Routes>
            {isFirstTime ? (
              <Route path="/" element={<FirstTimeSetup onComplete={handleSetupComplete} />} />
            ) : (
              <>
                <Route path="/" element={<Home />} />
                {/* Add more routes here */}
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </DownloadProvider>
    </ConfigProvider>
  );
}

export default App;
