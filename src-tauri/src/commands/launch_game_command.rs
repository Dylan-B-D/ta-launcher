// launch_tribes_command.rs

use tauri::Result;
use std::process::Command as SystemCommand;

#[derive(serde::Deserialize)]
pub struct LaunchOptions {
    exePath: Option<String>,
    launchArg: String,
}

#[tauri::command]
pub fn launch_game(options: LaunchOptions) -> Result<()> {
    let app_id = "17080"; // App ID for Tribes: Ascend on Steam
    let steam_url = format!("steam://rungameid/{}//{}", app_id, options.launchArg);

    SystemCommand::new("cmd")
        .args(["/C", "start", "", &steam_url])
        .spawn()
        .map(|_| ())
        .map_err(|e| e.into())
}

#[tauri::command]
pub fn launch_game_non_steam(options: LaunchOptions) -> Result<()> {
    // Use the provided executable path or a default one
    let exe_path = options.exePath.unwrap_or_else(|| "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tribes\\Binaries\\Win32\\TribesAscend.exe".to_string());

    SystemCommand::new(&exe_path)
        .args(["-hostx=Ta.dodgesdomain.com", &options.launchArg])
        .spawn()
        .map(|_| ()) // Convert Ok(Child) to Ok(())
        .map_err(|e| e.into()) // Convert std::io::Error to tauri::Error
}