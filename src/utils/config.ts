import { writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

export async function saveConfig(config: Record<string, any>) {
  await writeTextFile('config.json', JSON.stringify(config), { baseDir: BaseDirectory.AppLocalData });
}