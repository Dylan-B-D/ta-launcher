use std::fs::{self, copy, create_dir_all};
use std::path::PathBuf;
use tauri::{path::BaseDirectory, Manager};
use dirs;

/// Get the paths for the new and user config files.
/// 
/// The new config file is the one that is included in the app's resources.
/// The user config file is the one that is located in the user's documents directory.
/// 
fn get_config_paths(handle: &tauri::AppHandle, config_variant: &str) -> Result<(PathBuf, PathBuf), String> {
    let new_config_path = handle.path().resolve(
        format!("../public/configs/{}/tribes.ini", config_variant),
        BaseDirectory::Resource
    ).map_err(|e| e.to_string())?;

    let user_config_path = dirs::document_dir()
        .ok_or_else(|| "Could not find documents directory".to_string())?
        .join("My Games\\Tribes Ascend\\TribesGame\\config\\tribes.ini");

    Ok((new_config_path, user_config_path))
}

/// Handle a read-only file by temporarily setting it to read-write.
/// 
/// This function will set the file to read-write, perform the action, and then set it back to read-only.
/// 
fn handle_readonly(path: &PathBuf, action: impl FnOnce() -> Result<(), String>) -> Result<(), String> {
    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
    let is_read_only = metadata.permissions().readonly();

    if is_read_only {
        let mut permissions = metadata.permissions();
        permissions.set_readonly(false);
        fs::set_permissions(path, permissions).map_err(|e| e.to_string())?;
    }

    let result = action();

    if is_read_only {
        let mut permissions = fs::metadata(path).map_err(|e| e.to_string())?.permissions();
        permissions.set_readonly(true);
        fs::set_permissions(path, permissions).map_err(|e| e.to_string())?;
    }

    result
}

/// Check if the user config file exists and copy the new config file to the user's documents directory if it does not.
/// 
/// This function is used to ensure that the user has a config file in their documents directory.
/// 
#[tauri::command]
pub fn check_config(handle: tauri::AppHandle, config_variant: String) -> Result<ConfigCheckResult, String> {
    let (new_config_path, user_config_path) = get_config_paths(&handle, &config_variant)?;

    // Create the directory structure if it doesn't exist
    if let Some(parent) = user_config_path.parent() {
        create_dir_all(parent).map_err(|e| format!("Failed to create directory structure: {}", e))?;
    }

    if user_config_path.exists() {
        Ok(ConfigCheckResult { exists: true })
    } else {
        // If the file doesn't exist, we can create it and then use handle_readonly
        fs::File::create(&user_config_path).map_err(|e| format!("Failed to create config file: {}", e))?;
        
        handle_readonly(&user_config_path, || {
            copy(&new_config_path, &user_config_path).map(|_| ()).map_err(|e| e.to_string())
        })?;
        Ok(ConfigCheckResult { exists: false })
    }
}

/// Replace the user config file with the new config file.
///
/// This function is used to replace the user's config file with the new config file.
/// 
#[tauri::command]
pub fn replace_config(handle: tauri::AppHandle, config_variant: String) -> Result<ReplaceResult, String> {
    let (new_config_path, user_config_path) = get_config_paths(&handle, &config_variant)?;

    // Create the directory structure if it doesn't exist
    if let Some(parent) = user_config_path.parent() {
        create_dir_all(parent).map_err(|e| format!("Failed to create directory structure: {}", e))?;
    }

    // If the file doesn't exist, create it
    if !user_config_path.exists() {
        fs::File::create(&user_config_path).map_err(|e| format!("Failed to create config file: {}", e))?;
    }

    handle_readonly(&user_config_path, || {
        copy(&new_config_path, &user_config_path).map(|_| ()).map_err(|e| e.to_string())
    })?;

    Ok(ReplaceResult { message: "Preset loaded".to_string() })
}

#[derive(serde::Serialize)]
pub struct ConfigCheckResult {
    exists: bool,
}

#[derive(serde::Serialize)]
pub struct ReplaceResult {
    message: String,
}