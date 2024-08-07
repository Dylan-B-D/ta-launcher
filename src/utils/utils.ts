import { invoke } from "@tauri-apps/api/core";
import { ConfigFilesResult, Config } from "../interfaces";

// Get the list of available packages from the backend
export const getPackages = async (setPackages: (packages: any) => void) => {
  try {
    const packagesJson = await invoke("fetch_packages");
    const packages = JSON.parse(packagesJson as string);
    setPackages(packages);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
  }
};

export const findGamePath = async (
  setConfig: React.Dispatch<React.SetStateAction<Config>>
) => {
  try {
    const path = await invoke<string>("find_path");
    if (path) {
      setConfig((prevConfig: any) => ({ ...prevConfig, gamePath: path }));
    } else {
      console.error("Failed to find game path");
    }
  } catch (error) {
    console.error("Failed to find game path:", error);
  }
};

export const checkAndFindGamePath = (
  config: Config,
  setConfig: React.Dispatch<React.SetStateAction<Config>>
) => {
  if (config.gamePath === "") {
    findGamePath(setConfig);
  }
};

export const fetchConfigFiles = async (setIniValues: (values: any) => void) => {
  try {
    const result: ConfigFilesResult = await invoke("fetch_config_files");

    // Parse ini files
    const iniContent = parseIni(result.tribes_ini.content);
    const inputIniContent = parseIni(result.tribes_input_ini.content);

    // Initialize iniValues with fetched data if available, If value is true they are set to to, otherwise they are set to false
    setIniValues({
      DynamicLights: iniContent.DynamicLights === "True",
      DepthOfField: iniContent.DepthOfField === "True",
      MaxSmoothedFrameRate: parseInt(iniContent.MaxSmoothedFrameRate) || 240,
      Bloom: iniContent.Bloom === "True",
      MotionBlur: iniContent.MotionBlur === "True",
      bSmoothFrameRate: iniContent.bSmoothFrameRate === "True",
      bForceStaticTerrain: iniContent.bForceStaticTerrain === "True",
      SpeedTreeLeaves: iniContent.SpeedTreeLeaves === "True",
      SpeedTreeFronds: iniContent.SpeedTreeFronds === "True",
      AllowRadialBlur: iniContent.AllowRadialBlur === "True",
      OneFrameThreadLag: iniContent.OneFrameThreadLag === "True",
      m_bTinyWeaponsEnabled: iniContent.m_bTinyWeaponsEnabled === "True",
      UseVsync: iniContent.UseVsync === "True",
      ResX: parseInt(iniContent.ResX) || 1920,
      ResY: parseInt(iniContent.ResY) || 1080,
      bEnableMouseSmoothing: inputIniContent.bEnableMouseSmoothing === "True",
      FOVSetting: parseInt(inputIniContent.FOVSetting) || 90,
      MouseSensitivity: parseFloat(inputIniContent.MouseSensitivity) || 10.0,
    });
  } catch (error) {
    console.error("Error fetching config files:", error);
  }
};

function parseIni(iniContent: string): { [key: string]: string } {
  const lines = iniContent.split("\n");
  const iniObject: { [key: string]: string } = {};
  lines.forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      iniObject[key.trim()] = value.trim();
    }
  });
  return iniObject;
}

export const handleSensitivityChange = (
  value: number,
  iniValues: { [key: string]: boolean | number },
  config: Config,
  handleInputChange: (
    fileKey: string,
    key: string,
    value: boolean | number
  ) => void
) => {
  const maxFOV = 120;
  const fovScale = maxFOV / (iniValues.FOVSetting as number);
  const constant = 124_846.176;
  const newMouseSensitivity = (
    constant /
    (config.dpi * value * fovScale)
  ).toFixed(3);

  handleInputChange(
    "input",
    "MouseSensitivity",
    parseFloat(newMouseSensitivity)
  );
};

export const handleInputChange = (
  fileKey: string,
  key: string,
  value: boolean | number,
  setIniValues: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean | number }>
  >
) => {
  setIniValues((prevValues) => {
    const updatedValues = { ...prevValues, [key]: value };

    // Prepare data for backend
    const changes = [[key, value.toString()]];
    const file = fileKey === "input" ? "TribesInput.ini" : "tribes.ini";

    // Call Rust function via Tauri command
    invoke("update_ini_file", { file, changes }).catch(console.error);

    return updatedValues;
  });
};

export const openDirectory = async (pathType: string) => {
  try {
    await invoke("open_directory", { pathType });
  } catch (error) {
    console.error("Failed to open directory:", error);
  }
};
