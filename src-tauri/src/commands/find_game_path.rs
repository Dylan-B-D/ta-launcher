use std::path::{PathBuf, MAIN_SEPARATOR};
use winreg::enums::*;
use winreg::RegKey;
use log::{info, warn, error};
use std::fs;
use serde_json::Value;


/// Find the path to the Tribes Ascend executable.
/// 
/// This function will attempt to find the path to the Tribes Ascend executable by looking in the
/// default Steam library directory and any additional library directories specified in the
/// `libraryfolders.vdf` file. If the executable is found, the path will be returned as a string.
/// 
/// # Returns
/// 
/// - `Some(String)`: The path to the Tribes Ascend executable.
#[tauri::command]
pub fn find_path() -> Option<String> {
    let mut possible_dirs = Vec::new();

    // Try to get the Steam install directory from the registry
    if let Ok(hkey) = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey("Software\\Valve\\Steam")
    {
        if let Ok(steam_path) = hkey.get_value::<String, &str>("SteamPath") {
            let mut steam_path = PathBuf::from(steam_path);
            info!("Steam installation path found: {:?}", steam_path);

            // Normalize the path separators
            steam_path = steam_path.iter().collect();

            // Ensure the drive letter is uppercase
            if let Some(drive) = steam_path.to_str().and_then(|s| s.chars().next()) {
                if drive.is_ascii_lowercase() {
                    let mut steam_path_str = steam_path.to_string_lossy().to_string();
                    steam_path_str.replace_range(0..1, &drive.to_ascii_uppercase().to_string());
                    steam_path = PathBuf::from(steam_path_str);
                }
            }

            // Add the default Steam library path
            possible_dirs.push(steam_path.join(format!("steamapps{}common{}Tribes{}Binaries{}Win32", MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR)));

            // Parse libraryfolders.vdf to get additional Steam library paths
            let library_folders_path = steam_path.join(format!("steamapps{}libraryfolders.vdf", MAIN_SEPARATOR));
            if let Ok(content) = fs::read_to_string(library_folders_path) {
                if let Ok(vdf) = serde_json::from_str::<Value>(&content) {
                    if let Some(libraries) = vdf.get("LibraryFolders") {
                        for (key, value) in libraries.as_object().unwrap() {
                            if key.parse::<usize>().is_ok() {
                                let library_path = PathBuf::from(value.as_str().unwrap());
                                possible_dirs.push(library_path.join(format!("steamapps{}common{}Tribes{}Binaries{}Win32", MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR)));
                            }
                        }
                    }
                }
            } else {
                warn!("Failed to read libraryfolders.vdf.");
            }
        } else {
            warn!("SteamPath not found in registry.");
        }
    } else {
        warn!("Failed to open Steam registry key.");
    }

    // Check if the executable exists in any of the directories
    for dir in possible_dirs {
        let game_path = dir.join("TribesAscend.exe");
        if game_path.exists() {
            info!("Game found at: {:?}", game_path);
            return Some(game_path.to_string_lossy().to_string());
        }
    }
    error!("Game not found");
    None
}