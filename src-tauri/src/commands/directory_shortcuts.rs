use super::data::{get_app_local_data_dir, get_game_folder, get_tribes_dir, CONFIG_DIR};
use std::path::PathBuf;
use tauri::command;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

#[command]
pub fn open_directory(path_type: String, handle: AppHandle) -> Result<(), String> {
    let path: PathBuf = match path_type.as_str() {
        "config" => CONFIG_DIR.clone(),
        "tribes" => get_tribes_dir(&handle).unwrap_or_default(),
        "game_folder" => get_game_folder(&handle).unwrap_or_default(),
        "launcher_config" => get_app_local_data_dir(&handle),
        _ => return Err("Invalid path type".to_string()),
    };

    // Open the path with the default system handler
    handle
        .opener()
        .open_path(path.to_str().unwrap(), None::<&str>)
        .map_err(|e| format!("Failed to open directory: {}", e))
}
