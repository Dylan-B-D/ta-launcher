import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import MainPage from "./components/pages/MainPage";
import FirstTimeSetup from "./components/pages/FirstTimeSetup";
import { DownloadProvider } from "./contexts/DownloadContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { AppShell, Button, Container, Group, Modal, Stack, Text } from "@mantine/core";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import SettingsPage from "./components/pages/SettingsPage";
import PackageManagerPage from "./components/pages/PackageManagerPage";
import RouteManagerPage from "./components/pages/RouteManagerPage";
import ResourcesPage from "./components/pages/ResourcesPage";
import './components/componentStyles.css';
import ConfigPage from "./components/pages/ConfigPage";

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
        // setUpdateModalOpened(true); // TODO: Uncomment when updater is ready
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
              <Button color='rgb(200,200,100)' variant="outline" onClick={handleCancelUpdate}>Cancel</Button>
            </Group>
          </Container>
        </Modal>
        <Router>
          <Routes>
            {isFirstTime ? (
              <Route path="/" element={<FirstTimeSetup onComplete={handleSetupComplete} />} />
            ) : (
              <Route
                path="*"
                element={
                  <AppShell
                      padding="0"
                      header={{ height: 40 }}
                      footer={{ height: 60 }}
                      bg={"radial-gradient(circle at top center, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6)), " +
                        "radial-gradient(circle at bottom center, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1)), " +
                        "radial-gradient(circle at top left, rgba(120, 128, 128, 0.6), transparent), " +
                        "radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.6), transparent), " +
                        "url('../public/images/bg1.jpg') no-repeat center center / cover"}
                    >
                    <AppShell.Header bg={'none'} style={{ display: 'flex', alignItems: 'center', border: 'none' }}>
                      <Header />
                    </AppShell.Header>
                    <AppShell.Main bg={'none'}>
                      <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/package-manager" element={<PackageManagerPage />} />
                        <Route path="/route-manager" element={<RouteManagerPage />} />
                        <Route path="/resources" element={<ResourcesPage />} />
                        <Route path="/config" element={<ConfigPage />} />
                      </Routes>
                    </AppShell.Main>
                    <AppShell.Footer bg={'rgba(255, 255, 255, 0)'} style={{ display: 'flex', alignItems: 'center', border: 'none', backdropFilter:'blur(12px)' }}>
                      <Footer />
                    </AppShell.Footer>
                  </AppShell>
                }
              />
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </DownloadProvider>
    </ConfigProvider>
  );
}

export default App;
