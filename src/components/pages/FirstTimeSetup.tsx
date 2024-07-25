import { useEffect, useState } from "react";
import { Container, Button, TextInput, Stepper, Group, Space, Center, Title, Text, SegmentedControl, Divider, Grid, Table, Notification, rem, Switch, NumberInput, Tooltip, useMantineTheme, Box } from "@mantine/core";
import { open } from '@tauri-apps/plugin-dialog';
import { saveConfig } from "../../utils/config";
import { CardGradient } from "../CardGradient";
import { invoke } from "@tauri-apps/api/core";
import { resources } from "../../utils/usefulResources";
import { formatSize } from "../../utils/formatters";
import { confirm } from '@tauri-apps/plugin-dialog';
import { IconAlertCircle, IconCheck, IconCircleX, IconX } from '@tabler/icons-react';
import { ConfigCard } from "../ConfigCard";
import { configPresets } from "../../utils/configPresets";
import { CheckConfigResult, ConfigFile, ConfigFilesResult, Field, FirstTimeSetupProps, Packages, ReplaceConfigResult } from "../../interfaces";
import { iniFields } from "../../utils/iniFields";

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const theme = useMantineTheme();
  const [active, setActive] = useState(0);
  const [config, setConfig] = useState({
    gamePath: "",
    loginServer: "Community",
    launchMethod: "Non-Steam",
    dllVersion: "Release",
  });
  const [, setFileFound] = useState<null | boolean>(null);
  const [packages, setPackages] = useState<Packages>({});
  const [, setSelectedConfig] = useState<string | null>(null);
  const [gamePathError, setGamePathError] = useState(false);
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
  const [, setTribesIni] = useState<ConfigFile | null>(null);
  const [, setTribesInputIni] = useState<ConfigFile | null>(null);
  const [iniValues, setIniValues] = useState<{ [key: string]: boolean | number }>({
    DynamicLights: false,
    DepthOfField: false,
    MaxSmoothedFrameRate: 0,
  });

  async function fetchConfigFiles() {
    try {
      const result: ConfigFilesResult = await invoke('fetch_config_files');
      // console.log(result);
      setTribesIni(result.tribes_ini);
      setTribesInputIni(result.tribes_input_ini);

      // Initialize iniValues with fetched data if available, If value is true they are set to to, otherwise they are set to false
      const iniContent = parseIni(result.tribes_ini.content);
      setIniValues({
        DynamicLights: iniContent.DynamicLights === 'True',
        DepthOfField: iniContent.DepthOfField === 'True',
        MaxSmoothedFrameRate: parseInt(iniContent.MaxSmoothedFrameRate) || 240,
        Bloom: iniContent.Bloom === 'True',
        MotionBlur: iniContent.MotionBlur === 'True',
        bSmoothFrameRate: iniContent.bSmoothFrameRate === 'True',
        bForceStaticTerrain: iniContent.bForceStaticTerrain === 'True',
        SpeedTreeLeaves: iniContent.SpeedTreeLeaves === 'True',
        SpeedTreeFronds: iniContent.SpeedTreeFronds === 'True',
        AllowRadialBlur: iniContent.AllowRadialBlur === 'True',
      });
    } catch (error) {
      console.error('Error fetching config files:', error);
    }
  }

  function parseIni(iniContent: string): { [key: string]: string } {
    const lines = iniContent.split('\n');
    const iniObject: { [key: string]: string } = {};
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        iniObject[key.trim()] = value.trim();
      }
    });
    return iniObject;
  }

  function handleInputChange(key: string, value: boolean | number) {
    setIniValues(prevValues => ({ ...prevValues, [key]: value }));
  }

  const handleGamePathChange = (value: string) => {
    const trimmedValue = value.trim();
    setConfig({ ...config, gamePath: value });
    setGamePathError(trimmedValue === '');
  };

  useEffect(() => {
    if (active === 1) {
      setGamePathError(config.gamePath.trim() === '');
    }
  }, [active, config.gamePath]);

  const handleSelectConfig = async (configVariant: string) => {
    setSelectedConfig(configVariant);
    try {
      const result = await invoke('check_config', { configVariant }) as CheckConfigResult;

      if (result.exists) {
        const confirmed = await confirm('A config file already exists. This will replace it. \nAre you sure?', {
          title: 'Confirmation',
          kind: 'warning'
        });
        if (confirmed) {
          const replaceResult = await invoke('replace_config', { configVariant }) as ReplaceConfigResult;
          setNotification({
            visible: true,
            message: replaceResult.message,
            icon: <IconCheck />,
            color: 'green',
            title: "Success",
          });
        } else {
          setNotification({
            visible: true,
            message: 'Canceled loading preset',
            icon: <IconX />,
            color: 'yellow',
            title: "Canceled",
          });
        }
      } else {
        setNotification({
          visible: true,
          message: 'Preset Loaded',
          icon: <IconCheck />,
          color: 'green',
          title: "Success",
        });
      }
    } catch (error) {
      setNotification({
        visible: true,
        message: 'Error handling the configuration file.',
        icon: <IconX />,
        color: 'red',
        title: "Error",
      });
      console.error('Error handling the configuration file:', error);
    }
    fetchConfigFiles();
  };


  const nextStep = () => {
    checkAndFindGamePath();
    setActive((current) => (current < 5 ? current + 1 : current));
  };

  const prevStep = () => {
    checkAndFindGamePath();
    setActive((current) => (current > 0 ? current - 1 : current));
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

  const findGamePath = async () => {
    try {
      const path = await invoke<string>("find_path");
      if (path) {
        setConfig((prevConfig) => ({ ...prevConfig, gamePath: path }));
        setFileFound(true);
      } else {
        setFileFound(false);
      }
    } catch (error) {
      console.error("Failed to find game path:", error);
      setFileFound(false);
    }
  };

  const checkAndFindGamePath = () => {
    if (config.gamePath === "") {
      findGamePath();
    }
  };

  useEffect(() => {
    findGamePath();
    getPackages();
    fetchConfigFiles();
  }, []);

  const getPackages = async () => {
    try {
      const packagesJson = await invoke('fetch_packages')
      const packages = JSON.parse(packagesJson as string)
      // console.log(packages)
      setPackages(packages)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  };

  const renderInputField = (field: Field) => {
    
    if (field.type === 'boolean') {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Switch
            checked={iniValues[field.key] as boolean}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(field.key, event.currentTarget.checked)
            }
            size="md"
            onLabel="On"
            offLabel="Off"
            color="teal"
            thumbIcon={
              iniValues[field.key] ? (
                <IconCheck
                  style={{ width: rem(12), height: rem(12) }}
                  color={theme.colors.teal[6]}
                  stroke={3}
                />
              ) : (
                <IconX
                  style={{ width: rem(12), height: rem(12) }}
                  color={theme.colors.red[6]}
                  stroke={3}
                />
              )
            }
          />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <NumberInput
            value={iniValues[field.key] as number}
            onChange={(value: string | number) =>
              handleInputChange(field.key, Number(value) || 0)
            }
            size="xs"
            w={75}
            variant="filled"
            style={{ marginBottom: '-3px', marginTop: '-3px' }} // Fix for NumberInput height to match Switch
          />
        </div>
      );
    }
  };

  return (
    <><>
      {notification.visible && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, maxWidth: '30%', zIndex: '1000' }}>
          <Notification
            icon={notification.icon}
            title={notification.title}
            color={notification.color}
            onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
            style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}
          >
            {notification.message}
          </Notification>
        </div>
      )}
    </><Container p={0} fluid style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
              <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
                <Text size="sm" mt="md" c="dimmed">
                  A Tribes: Ascend installation is required. (<strong>Recommended:</strong> Steam version)
                </Text>
                <Space h="xl" />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button
                    component="a"
                    href="steam://install/17080"
                    variant="light"
                    color="cyan"
                  >
                    Install Through Steam
                  </Button>
                  <Button
                    component="a"
                    href="https://library.theexiled.pwnageservers.com/file.php?id=2962"
                    target="_blank"
                    variant="light"
                    color="cyan"
                  >
                    Install as a standalone from The Exiled
                  </Button>
                </div>
                <Text size="sm" c="dimmed" mt="xl">
                  If the path to the TribesAscend.exe executable is not detected, you can manually add it.
                </Text>
                <Text size="sm" c="dimmed">
                  The executable is usually located in: '..\Tribes\Binaries\Win32\TribesAscend.exe'
                </Text>
              </Center>
              <Space h="xl" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TextInput
                    style={{ flexGrow: 1 }}
                    value={config.gamePath}
                    onChange={(e) => handleGamePathChange(e.currentTarget.value)}
                    placeholder="Enter game path..."
                    error={gamePathError}
                  />
                  <Button color="cyan" onClick={selectFile}>Choose File</Button>
                </div>
                <div style={{ minHeight: '20px' }}>
                  {gamePathError && <Text size="sm" c="red">*Game path is required</Text>}
                </div>
              </div>
              <Space h="sm" />
              <Center>
                <Button color="cyan" onClick={findGamePath}>Find Steam Game Path</Button>
              </Center>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title order={4}>Launch Method</Title>
                <Text size="sm" c="dimmed"><strong>Recommended:</strong> Non-Steam</Text>
              </div>
              <Text size="sm" c="dimmed">
                <strong>Non-Steam:</strong> Launches executable directly, and can inject based on game events.
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Steam:</strong> Launches the game through Steam, and injects using a timer.
              </Text>
              <Space h="sm" />
              <SegmentedControl
                value={config.launchMethod}
                onChange={(value) => setConfig({ ...config, launchMethod: value })}
                data={["Non-Steam", "Steam"]} />

              <Divider my="xs" />

              <Title order={4}>Login Server</Title>
              <Text size="sm" c="dimmed">
                Select a server to connect to.
              </Text>
              <Text size="sm" mt={"xs"} c="dimmed">
                <strong>Community:</strong> Community login server hosted by Griffon.
              </Text>
              <Text size="sm" c="dimmed">
                <strong>PUG:</strong> PUG login server hosted by Dodge. Used for organised and competitive play with custom rulesets.
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Custom:</strong> Enter a custom login server to connect to.
              </Text>
              <Space h="sm" />
              <SegmentedControl
                value={config.loginServer}
                onChange={(value) => setConfig({ ...config, loginServer: value })}
                data={["Community", "PUG", "Custom"]} />

              <Divider my="xs" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title order={4}>DLL Version</Title>
                <Text size="sm" c="dimmed"><strong>Recommended:</strong> Release</Text>
              </div>
              <Text size="sm" c="dimmed">
                <strong>Release:</strong> The latest stable version of TAMods.
              </Text>
              <Text size="sm" c="dimmed">
                <strong>Note:</strong> Other versions are mostly used for testing purposes.
              </Text>
              <Space h="sm" />
              <SegmentedControl
                value={config.dllVersion}
                onChange={(value) => setConfig({ ...config, dllVersion: value })}
                data={["Release", "Beta", "Edge"]} />
            </Stepper.Step>

            {/* ----------- Config Options ----------- */}
            <Stepper.Step label="Config">
              <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%', width: '100%' }}>
                <Text c="dimmed" size="sm">
                  <strong>INI Presets:</strong> Select a preset to apply (if you want).
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
                        onApply={() => handleSelectConfig(config.id)}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
                <Space h="xs" />
                <Group align="flex-start" grow style={{ width: '100%' }}>
                  <Box style={{ width: '100%' }}>
                    <Table striped withTableBorder withRowBorders={false} style={{ tableLayout: 'fixed', width: '100%' }}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ textAlign: 'left', width: '60%' }}>Setting</Table.Th>
                          <Table.Th style={{ textAlign: 'right', width: '40%' }}>Value</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {iniFields.slice(0, Math.ceil(iniFields.length / 2)).map(field => (
                          <Table.Tr key={field.key}>
                            <Table.Td style={{ textAlign: 'left' }}>
                              <Tooltip label={field.description} withArrow>
                                <div>{field.displayName}</div>
                              </Tooltip>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              {renderInputField(field)}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>

                  <Box style={{ width: '100%' }}>
                    <Table striped withTableBorder withRowBorders={false} style={{ tableLayout: 'fixed', width: '100%' }}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ textAlign: 'left', width: '60%' }}>Setting</Table.Th>
                          <Table.Th style={{ textAlign: 'right', width: '40%' }}>Value</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {iniFields.slice(Math.ceil(iniFields.length / 2)).map(field => (
                          <Table.Tr key={field.key}>
                            <Table.Td style={{ textAlign: 'left' }}>
                              <Tooltip label={field.description} withArrow>
                                <div>{field.displayName}</div>
                              </Tooltip>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                              {renderInputField(field)}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>
                </Group>
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