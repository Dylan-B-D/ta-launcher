import { writeTextFile, BaseDirectory, readTextFile } from '@tauri-apps/plugin-fs';;

export async function saveConfig(config: Record<string, any>) {
  await writeTextFile('config.json', JSON.stringify(config), { baseDir: BaseDirectory.AppLocalData });
}

export const loadConfig = async (setConfig: React.Dispatch<React.SetStateAction<any>>) => {
  try {
    const savedConfig = await readTextFile('config.json', { baseDir: BaseDirectory.AppLocalData });
    if (savedConfig) {
      setConfig((prevConfig: Record<string, any>) => ({
        ...prevConfig,
        ...(JSON.parse(savedConfig) as Record<string, any>),
      }));
    }
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('First-time setup: No config file found.');
    } else {
      console.error('Failed to load config:', error);
    }
  }
};