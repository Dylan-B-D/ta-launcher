import { writeTextFile, BaseDirectory, readTextFile, exists } from '@tauri-apps/plugin-fs';;

const DOWNLOADED_PACKAGES_FILE = 'downloaded_packages.json';
const CONFIG_FILE = 'config.json';

export async function saveConfig(config: Record<string, any>) {
  await writeTextFile(CONFIG_FILE, JSON.stringify(config), { baseDir: BaseDirectory.AppLocalData });
}

export const loadConfig = async (setConfig: React.Dispatch<React.SetStateAction<any>>) => {
  try {
    const fileExists = await exists(CONFIG_FILE, { baseDir: BaseDirectory.AppLocalData });

    if (!fileExists) {
      console.log('First-time setup: No config file found.');
      return;
    }

    const savedConfig = await readTextFile(CONFIG_FILE, { baseDir: BaseDirectory.AppLocalData });
    if (savedConfig) {
      setConfig((prevConfig: Record<string, any>) => ({
        ...prevConfig,
        ...(JSON.parse(savedConfig) as Record<string, any>),
      }));
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
};
export async function saveDownloadedPackages(packages: Map<string, string>) {
  await writeTextFile(
    DOWNLOADED_PACKAGES_FILE,
    JSON.stringify(Object.fromEntries(packages)),
    { baseDir: BaseDirectory.AppLocalData }
  );
}

export async function loadDownloadedPackages(): Promise<Map<string, string>> {
  try {
    const fileExists = await exists(DOWNLOADED_PACKAGES_FILE, { baseDir: BaseDirectory.AppLocalData });

    if (!fileExists) {
      console.log('Downloaded packages file not found, this is expected on the first launch.');
      return new Map();
    }

    const savedPackages = await readTextFile(DOWNLOADED_PACKAGES_FILE, { baseDir: BaseDirectory.AppLocalData });
    return new Map(Object.entries(JSON.parse(savedPackages)));
  } catch (error) {
    console.error('Failed to load downloaded packages:', error);
    return new Map();
  }
}