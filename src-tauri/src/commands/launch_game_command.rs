// launch_tribes_command.rs

use tauri::Result;
use std::process::Command as SystemCommand;

#[tauri::command]
pub fn launch_game() -> Result<()> {
    let app_id = "17080"; // App ID for Tribes:Ascend on steam
    let steam_url = format!("steam://rungameid/{}", app_id);

    SystemCommand::new("cmd")
        .args(["/C", "start", "", &steam_url])
        .spawn()
        .map(|_| ())
        .map_err(|e| e.into())
}
// TODO fix launch args

#[tauri::command]
pub fn launch_game_non_steam() -> Result<()> {
    SystemCommand::new("C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tribes\\Binaries\\Win32\\TribesAscend.exe")
        .args(["-hostx=ta.kfk4ever.com"])
        .spawn()
        .map(|_| ()) // Convert Ok(Child) to Ok(())
        .map_err(|e| e.into()) // Convert std::io::Error to tauri::Error
}
// .args(["-hostx=Ta.dodgesdomain.com"])