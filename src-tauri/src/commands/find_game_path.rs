use log::{debug, error, warn};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf, MAIN_SEPARATOR};
use winreg::enums::*;
use winreg::RegKey;

/// Find the path to the Tribes Ascend executable.
#[tauri::command]
pub fn find_path() -> Option<String> {
    let steam_path = get_steam_path()?;
    let possible_dirs = get_possible_directories(&steam_path);
    find_tribes_executable(possible_dirs)
}

fn get_steam_path() -> Option<PathBuf> {
    let hkey = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey("Software\\Valve\\Steam")
        .ok()?;
    let steam_path: String = hkey.get_value("SteamPath").ok()?;
    let steam_path = PathBuf::from(steam_path);
    debug!("Steam installation path found: {:?}", steam_path);
    Some(PathBuf::from(capitalize_path(&steam_path)))
}

fn get_possible_directories(steam_path: &Path) -> Vec<PathBuf> {
    let mut possible_dirs = vec![get_default_steam_library(steam_path)];
    possible_dirs.extend(get_additional_libraries(steam_path));
    possible_dirs
}

fn get_default_steam_library(steam_path: &Path) -> PathBuf {
    steam_path.join(format!(
        "steamapps{}common{}Tribes{}Binaries{}Win32",
        MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR
    ))
}

fn get_additional_libraries(steam_path: &Path) -> Vec<PathBuf> {
    let library_folders_path = steam_path.join(format!("steamapps{}libraryfolders.vdf", MAIN_SEPARATOR));
    
    let content = match fs::read_to_string(&library_folders_path) {
        Ok(content) => content,
        Err(e) => {
            warn!("Failed to read libraryfolders.vdf: {}", e);
            return Vec::new();
        }
    };

    let libraries = parse_vdf(&content);

    libraries.into_iter()
        .filter_map(|(key, value)| {
            if key.parse::<usize>().is_ok() {
                value.get("path").map(|path| {
                    PathBuf::from(path).join(format!(
                        "steamapps{}common{}Tribes{}Binaries{}Win32",
                        MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR, MAIN_SEPARATOR
                    ))
                })
            } else {
                None
            }
        })
        .collect()
}

fn parse_vdf(content: &str) -> HashMap<String, HashMap<String, String>> {
    let mut result = HashMap::new();
    let mut current_key = String::new();
    let mut current_map = HashMap::new();

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('"') && trimmed.ends_with('"') {
            let parts: Vec<&str> = trimmed.trim_matches('"').splitn(2, "\"").collect();
            if parts.len() == 2 {
                let key = parts[0].trim();
                let value = parts[1].trim().trim_matches('"');
                if key == "path" {
                    current_map.insert(key.to_string(), value.to_string());
                } else if value.is_empty() {
                    if !current_key.is_empty() {
                        result.insert(current_key, current_map);
                        current_map = HashMap::new();
                    }
                    current_key = key.to_string();
                }
            }
        }
    }

    if !current_key.is_empty() {
        result.insert(current_key, current_map);
    }

    result
}

fn find_tribes_executable(possible_dirs: Vec<PathBuf>) -> Option<String> {
    for dir in possible_dirs {
        let game_path = dir.join("TribesAscend.exe");
        if game_path.exists() {
            debug!("Game found at: {:?}", game_path);
            return Some(game_path.to_string_lossy().to_string());
        }
    }
    error!("Game not found");
    None
}

/// Capitalizes each word in the path to make it look more like a standard filesystem path
fn capitalize_path(path: &Path) -> PathBuf {
    let components = path.iter().map(|component| {
        component.to_str().unwrap_or("")
            .split_whitespace()
            .map(|word| {
                let mut chars = word.chars();
                chars.next().map_or(String::new(), |f| f.to_uppercase().collect::<String>() + chars.as_str())
            })
            .collect::<Vec<String>>()
            .join(" ")
    });

    let mut new_path = PathBuf::new();
    for component in components {
        new_path.push(component);
    }
    new_path
}
