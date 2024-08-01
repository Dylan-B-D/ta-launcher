use once_cell::sync::Lazy;
use serde_json::Value;
use tauri::{path::BaseDirectory, AppHandle, Manager};
use std::{fs, path::PathBuf};

/// Store the name and default path of a config file.
pub struct ConfigFileInfo {
    pub name: &'static str,
    pub default_path: &'static str,
}

pub const PKG_ENDPOINT: &str = "https://client.update.tamods.org/";             // The endpoint for downloading packages
pub const PKG_CFG_FILE: &str = "packageconfig.yaml";                            // File that contains package list and dependencies

pub static DOCS_DIR: Lazy<PathBuf> = Lazy::new(|| {                             // The user's documents directory
    dirs::document_dir().expect("Failed to get documents directory")
});

pub static CONFIG_DIR: Lazy<PathBuf> = Lazy::new(|| {                           // The Tribes config directory
    DOCS_DIR.join("My Games")
            .join("Tribes Ascend")
            .join("TribesGame")
            .join("config")
});

/// A list of default config files to use if defaults do not exist.
pub const CONFIG_FILES: [ConfigFileInfo; 4] = [
    ConfigFileInfo { name: "tribes.ini", default_path: "../public/configs/defaultini/tribes.ini" }, // Default but: Disabled Vsync, motion blur, and set force static terrain to true
    ConfigFileInfo { name: "TribesInput.ini", default_path: "../public/configs/defaultinput/TribesInput.ini" }, // Default but: Reduced mouse sensitivity to 10 from 30
    ConfigFileInfo { name: "TribesHelpText.ini", default_path: "../public/configs/defaulttribeshelptext/TribesHelpText.ini" }, // Disabled help text by default
    ConfigFileInfo { name: "TribesUser.ini", default_path: "../public/configs/defaulttribesuser/TribesUser.ini" },  // Default
];

pub const LOGIN_SERVER_PUG: &str = "ta.dodgesdomain.com";
pub const LOGIN_SERVER_COMMUNITY: &str = "ta.kfk4ever.com:9080";

pub static LOGIN_SERVER_PUG_DETAILS: Lazy<String> = Lazy::new(|| {
    format!("http://{}:9080/detailed_status", LOGIN_SERVER_PUG)
});

pub static LOGIN_SERVER_COMMUNITY_DETAILS: Lazy<String> = Lazy::new(|| {
    format!("http://{}/detailed_status", LOGIN_SERVER_COMMUNITY)
});

/// Function to get the app local data directory
/// 
/// # Arguments
/// 
/// * `handle` - The AppHandle object
/// 
/// # Returns
/// 
/// * `PathBuf` - The path to the app local data directory
pub fn get_app_local_data_dir(handle: &AppHandle) -> PathBuf {
    handle.path().app_local_data_dir().expect("failed to get appdata dir")
}

/// Function to get the launcher config file path and return the JSON object
/// 
/// # Arguments
/// 
/// * `handle` - The AppHandle object
/// 
/// # Returns
/// 
/// * `Result<Value, String>` - The JSON object of the config file
pub fn get_launcher_config_file(handle: &AppHandle) -> Result<Value, String> {
    let app_data_dir = get_app_local_data_dir(handle);
    let config_path = app_data_dir.join("config.json");

    let config_content = fs::read_to_string(&config_path)
        .map_err(|err| format!("Failed to read config file: {}", err))?;

    let config_json: Value = serde_json::from_str(&config_content)
        .map_err(|err| format!("Failed to parse config file: {}", err))?;

    Ok(config_json)
}

/// Function to extract the game path from the configuration file
pub fn get_game_path(handle: &AppHandle) -> Result<PathBuf, String> {
    let config_json = get_launcher_config_file(handle)?;
    let game_path_str = config_json["gamePath"].as_str()
        .ok_or_else(|| "gamePath not found in config file".to_string())?;
    Ok(PathBuf::from(game_path_str))
}

/// Function to get the game folder
pub fn get_game_folder(handle: &AppHandle) -> Result<PathBuf, String> {
    let game_path = get_game_path(handle)?;
    Ok(game_path.parent().expect("Failed to get game folder").to_path_buf())
}

/// Function to get the Tribes directory
pub fn get_tribes_dir(handle: &AppHandle) -> Result<PathBuf, String> {
    let game_folder = get_game_folder(handle)?;
    Ok(game_folder.parent().expect("Failed to get Binaries folder").parent().expect("Failed to get parent of Binaries").to_path_buf())
}

/// Function to get the original DLLs directory
///
/// # Arguments
///
/// * `handle` - The AppHandle object
///
/// # Returns
///
/// * `Result<PathBuf, String>` - The path to the original DLLs directory or an error message
pub fn get_original_dlls_dir(handle: &AppHandle) -> Result<PathBuf, String> {
    match handle.path().resolve("../public/originalDLLs", BaseDirectory::Resource) {
        Ok(path) => Ok(path),
        Err(e) => Err(format!("Failed to get original DLLs directory: {}", e)),
    }
}