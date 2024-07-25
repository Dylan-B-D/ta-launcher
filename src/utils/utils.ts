import { invoke } from "@tauri-apps/api/core";
import { ConfigFilesResult } from "../interfaces";

// Get the list of available packages from the backend
export const getPackages = async (setPackages: (packages: any) => void) => {
    try {
        const packagesJson = await invoke('fetch_packages');
        const packages = JSON.parse(packagesJson as string);
        setPackages(packages);
    } catch (error) {
        console.error('Failed to fetch packages:', error);
    }
};

export const findGamePath = async (setConfig: (config: any) => void, setFileFound: (found: boolean) => void) => {
    try {
        const path = await invoke<string>("find_path");
        if (path) {
            setConfig((prevConfig: any) => ({ ...prevConfig, gamePath: path }));
            setFileFound(true);
        } else {
            setFileFound(false);
        }
    } catch (error) {
        console.error("Failed to find game path:", error);
        setFileFound(false);
    }
};

export const checkAndFindGamePath = (config: { gamePath: string }, findGamePath: () => void) => {
    if (config.gamePath === "") {
        findGamePath();
    }
};

export const fetchConfigFiles = async (
    setTribesIni: (ini: any) => void,
    setTribesInputIni: (ini: any) => void,
    setIniValues: (values: any) => void
) => {
    try {
        const result: ConfigFilesResult = await invoke('fetch_config_files');
        // console.log(result);
        setTribesIni(result.tribes_ini);
        setTribesInputIni(result.tribes_input_ini);

        // Parse ini files
        const iniContent = parseIni(result.tribes_ini.content);
        const inputIniContent = parseIni(result.tribes_input_ini.content);

        // Initialize iniValues with fetched data if available, If value is true they are set to to, otherwise they are set to false
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
            OneFrameThreadLag: iniContent.OneFrameThreadLag === 'True',
            m_bTinyWeaponsEnabled: iniContent.m_bTinyWeaponsEnabled === 'True',
            UseVsync: iniContent.UseVsync === 'True',
            ResX: parseInt(iniContent.ResX) || 1920,
            ResY: parseInt(iniContent.ResY) || 1080,
            bEnableMouseSmoothing: inputIniContent.bEnableMouseSmoothing === 'True',
            FOVSetting: parseInt(inputIniContent.FOVSetting) || 90,
            MouseSensitivity: parseFloat(inputIniContent.MouseSensitivity) || 10.0,
        });
    } catch (error) {
        console.error('Error fetching config files:', error);
    }
};

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