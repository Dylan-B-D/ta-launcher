import { useEffect, useState } from "react";
import { Container, Button, Stepper, Group, Space, Center, Title, Text, Grid, Table, rem } from "@mantine/core";
import { open } from '@tauri-apps/plugin-dialog';
import { loadConfig, saveConfig } from "../../utils/config";
import { CardGradient } from "../CardGradient";
import { invoke } from "@tauri-apps/api/core";
import { resources } from "../../data/usefulResources";
import { formatSize } from "../../utils/formatters";
import { IconAlertCircle, IconCircleX } from '@tabler/icons-react';
import { ConfigCard } from "../ConfigCard";
import { configPresets } from "../../data/configPresets";
import { ConfigFile, FirstTimeSetupProps, Packages } from "../../interfaces";
import { iniFields, inputIniFields } from "../../data/iniFields";
import ConfigSettingsTable from "../ConfigSettingsTable";
import SensitivityCalculator from "../SensitivityCalculator";
import { GamePathStep } from "../GamePathStep";
import NotificationPopup from "../NotificationPopup";
import LaunchOptions from "../LaunchOptionsStep";
import { fetchConfigFiles, findGamePath, getPackages } from "../../utils/utils";

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const [active, setActive] = useState(0);
  const [, setFileFound] = useState<null | boolean>(null);
  const [packages, setPackages] = useState<Packages>({});
  const [gamePathError, setGamePathError] = useState(false);
  const [, setTribesIni] = useState<ConfigFile | null>(null);
  const [, setTribesInputIni] = useState<ConfigFile | null>(null);
  const [iniValues, setIniValues] = useState<{ [key: string]: boolean | number }>({});
  const allFields = [...iniFields, ...inputIniFields];
  const third = Math.ceil(allFields.length / 3);
  const [config, setConfig] = useState({
    gamePath: "",
    loginServer: "Community",
    launchMethod: "Non-Steam",
    dllVersion: "Release",
    dpi: 800,
  });
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    title: string;
    color: string;
    icon: JSX.Element | null;
}>({
    visible: false,
    message: '',
    title: '',
    color: '',
    icon: null,
});

  // Initilize: Game Path, Config Files, Config Values and Packages
  useEffect(() => {
    findGamePath(setConfig, setFileFound);
    getPackages(setPackages); 
    fetchConfigFiles(setTribesIni, setTribesInputIni, setIniValues);
    loadConfig(setConfig);
  }, []);

  const handleDpiChange = (value: number) => {
    setConfig(prev => ({ ...prev, dpi: value }));
  };

  const handleSensitivityChange = (value: number) => {
    const maxFOV = 120;
    const fovScale = maxFOV / (iniValues.FOVSetting as number);
    const constant = 124_846.176;
    const newMouseSensitivity = (constant / (config.dpi * value * fovScale)).toFixed(3);
    
    handleInputChange('input', 'MouseSensitivity', parseFloat(newMouseSensitivity));
  };

  function handleInputChange(fileKey: string, key: string, value: boolean | number) {
    setIniValues(prevValues => {
      const updatedValues = { ...prevValues, [key]: value };
  
      // Prepare data for backend
      const changes = [[key, value.toString()]];
      const file = fileKey === 'input' ? 'TribesInput.ini' : 'tribes.ini';
  
      // Call Rust function via Tauri command
      invoke('update_ini_file', { file, changes })
        .catch(console.error);
  
      return updatedValues;
    });
  }  

  const handleGamePathChange = (value: string) => {
    const trimmedValue = value.trim();
    setConfig({ ...config, gamePath: value });
    setGamePathError(trimmedValue === '');
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    checkAndFindGamePath();
    // Check for empty config values
    const emptyFields = Object.entries(config)
      .filter(([, value]) => value === "")
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      setNotification({
        visible: true,
        message: `You cannot continue without: ${emptyFields.join(", ")}`,
        title: "Missing Configuration",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }
    await saveConfig(config);
    // localStorage.setItem("isFirstTime", "false");
    onComplete();
  };

  useEffect(() => {
    if (active === 1) {
      setGamePathError(config.gamePath.trim() === '');
    }
  }, [active, config.gamePath]);

  const nextStep = () => {
    checkAndFindGamePath();
    setActive((current) => (current < 5 ? current + 1 : current));
  };

  const prevStep = () => {
    checkAndFindGamePath();
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  const selectFile = async () => {
    try {
      const selected = await open();

      if (selected && typeof selected.path === "string" && selected.path.endsWith(".exe")) {
        setConfig((prevConfig) => ({ ...prevConfig, gamePath: selected.path }));
        setFileFound(true);
      } else {
        setFileFound(false);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const checkAndFindGamePath = () => {
    if (config.gamePath === "") {
      findGamePath(setConfig, setFileFound);
    }
  };

  return (
    <>
      <NotificationPopup
                visible={notification.visible}
                message={notification.message}
                title={notification.title}
                color={notification.color}
                onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
                icon={notification.icon}
            />
    <Container p={0} fluid style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Stepper p={"md"} color="teal" size="sm" active={active} onStepClick={setActive}>

            {/* ----------- Welcome ----------- */}
            <Stepper.Step label="Welcome">
              <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
                <Title order={2}>First-time Setup</Title>
                <Text size="sm" mt="md" c="dimmed">
                  Any options changed here can be modified later. For additional assistance, ask for help in one of the following Discord servers or message 'evxl.' on Discord.
                </Text>
                <Title mt="md" order={5}>Useful Resource Links</Title>
                <Grid mt="md">
                  {resources.map((resource, index) => (
                    <Grid.Col span={4} key={index}>
                      <CardGradient
                        icon={resource.icon}
                        image={resource.image}
                        gradient={resource.gradient}
                        title={resource.title}
                        description={resource.description}
                        link={resource.link}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Center>
            </Stepper.Step>

            {/* ----------- Game Path ----------- */}
            <Stepper.Step
              label="Game Path"
              color={gamePathError ? "red" : "teal"}
              completedIcon={gamePathError ? <IconCircleX style={{ width: rem(20), height: rem(20) }} /> : undefined}
            >
              <GamePathStep
                config={config}
                gamePathError={gamePathError}
                handleGamePathChange={handleGamePathChange}
                selectFile={selectFile}
                findGamePath={() => findGamePath(setConfig, setFileFound)}
              />
            </Stepper.Step>

            {/* ----------- Packages ----------- */}
            <Stepper.Step label="Packages">
              <Text size="sm" c="dimmed">
                <strong>Minimum </strong>(GOTY and TAMODs): TAMods Core Library
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Recommended:</strong> TAMods Core Library, TAMods Standard Library, Community Made Maps, and Recommended GOTY Routes Library
              </Text>

              <Space h="xs" />

              <Table withRowBorders={false} striped verticalSpacing="6px">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Size</Table.Th>
                    <Table.Th>Last Modified</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.values(packages).map(({ package: pkg }) => (
                    <Table.Tr key={pkg.id}>
                      <Table.Td>{pkg.displayName}</Table.Td>
                      <Table.Td>{pkg.description}</Table.Td>
                      <Table.Td>{formatSize(pkg.totalSize || pkg.size)}</Table.Td>
                      <Table.Td>{new Date(pkg.lastModified).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Button radius="lg" variant="light" color="cyan" onClick={() => console.log('Install', pkg.displayName)}>
                          Install
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

            </Stepper.Step>

            {/* ----------- Launch Options ----------- */}
            <Stepper.Step label="Options">
            <LaunchOptions config={config} setConfig={setConfig} />

            </Stepper.Step>

            {/* ----------- Config Options ----------- */}
            <Stepper.Step label="Config">
              <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%', width: '100%' }}>
                <Text c="dimmed" size="sm">
                  <strong>Tribes.ini Presets:</strong> Select a preset to apply (if you want).
                </Text>
                <Text c="dimmed" size="sm">
                  *INI files are graphics config files that let you change more options that in-game.
                </Text>
                <Grid mt="xs" gutter="xs">
                  {configPresets.map((config) => (
                    <Grid.Col span={4} key={config.id}>
                      <ConfigCard
                        title={config.displayName}
                        author={config.author}
                        description={config.description}
                        configId={config.id}
                        setNotification={setNotification}
                        fetchConfigFiles={async () => {
                          await fetchConfigFiles(setTribesIni, setTribesInputIni, setIniValues);
                        }}
                    />
                    </Grid.Col>
                  ))}
                </Grid>
                <Space h="xs" />
                <Group align="flex-start" grow style={{ width: '100%' }}>
                  <ConfigSettingsTable
                    fields={iniFields.slice(0, third)}
                    iniValues={iniValues}
                    handleInputChange={(key, value) => handleInputChange('main', key, value)}
                  />
                  <ConfigSettingsTable
                    fields={iniFields.slice(third, third * 2)}
                    iniValues={iniValues}
                    handleInputChange={(key, value) => handleInputChange('main', key, value)}
                  />
                  <ConfigSettingsTable
                    fields={inputIniFields}
                    iniValues={iniValues}
                    handleInputChange={(key, value) => handleInputChange('input', key, value)}
                  />
                </Group>

                <SensitivityCalculator 
                  mouseSensitivity={iniValues.MouseSensitivity as number} 
                  FOVSetting={iniValues.FOVSetting as number}
                  dpi={config.dpi}
                  onDpiChange={handleDpiChange}
                  onSensitivityChange={handleSensitivityChange}
                />

              </Center>
            </Stepper.Step>
          </Stepper>
        </div>
        <Group
          p={"xs"}
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "rgba(128, 128, 128, 0.1)",
            borderTop: "solid 1px rgba(128, 128, 128, 0.25)",
            zIndex: 999,
          }}
          justify="center"
        >
          <Button color="cyan" radius="xl" variant="subtle" size="sm" onClick={prevStep}>Back</Button>
          {active === 4 ? (
            <Button radius="xl" variant="gradient" gradient={{ from: 'cyan', to: 'teal', deg: 253 }} size="sm" onClick={handleSetup}>Finish</Button>
          ) : (
            <Button radius="xl" variant="gradient" gradient={{ from: 'cyan', to: 'teal', deg: 253 }} size="sm" onClick={nextStep}>Next</Button>
          )}
        </Group>
      </Container></>
  );
};

export default FirstTimeSetup;