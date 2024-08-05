use super::data::{CONFIG_DIR, CONFIG_FILES};
use std::fs::{self, copy, create_dir_all};
use std::io::Read;
use std::path::PathBuf;
use tauri::{path::BaseDirectory, Manager};

/// Store the content and permissions of a config file.
#[derive(serde::Serialize)]
pub struct ConfigFile {
    content: String,
    permissions: String,
}

/// Store the content and permissions of the tribes.ini and TribesInput.ini files.
#[derive(serde::Serialize)]
pub struct ConfigFilesResult {
    tribes_ini: ConfigFile,
    tribes_input_ini: ConfigFile,
}

/// Fetch the tribes.ini and TribesInput.ini files from the user's documents directory.
/// Additionally, check and copy the default files if they don't exist.
///
/// # Returns
///
/// The content and permissions of the tribes.ini and TribesInput.ini files.
#[tauri::command]
pub fn fetch_config_files(handle: tauri::AppHandle) -> Result<ConfigFilesResult, String> {
    // Ensure the config directory exists
    if !CONFIG_DIR.exists() {
        create_dir_all(&*CONFIG_DIR)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    // Check and copy default files if they don't exist
    for file_info in &CONFIG_FILES {
        let target_path = CONFIG_DIR.join(file_info.name);
        let default_path = handle
            .path()
            .resolve(file_info.default_path, BaseDirectory::Resource)
            .map_err(|e| e.to_string())?;

        if !default_path.exists() {
            return Err(format!(
                "Default {} file not found: {}",
                file_info.name,
                default_path.display()
            ));
        }

        if !target_path.exists() {
            copy(&default_path, &target_path)
                .map_err(|e| format!("Failed to copy {}: {}", file_info.name, e))?;
        }
    }

    // Read and get permissions for tribes.ini and TribesInput.ini
    let tribes_ini_path = CONFIG_DIR.join("tribes.ini");
    let tribes_input_ini_path = CONFIG_DIR.join("TribesInput.ini");

    Ok(ConfigFilesResult {
        tribes_ini: read_config_file(&tribes_ini_path)?,
        tribes_input_ini: read_config_file(&tribes_input_ini_path)?,
    })
}

/// Update the tribes.ini file with the specified changes.
///
/// # Arguments
///
/// * `changes` - The changes to apply to the tribes.ini file.
///
/// # Returns
///
/// An error message if the operation failed.
#[tauri::command]
pub fn update_ini_file(file: String, changes: Vec<(String, String)>) -> Result<(), String> {
    let file_path = CONFIG_DIR.join(file);

    let mut content = read_file(&file_path)?;
    let mut lines: Vec<String> = content.split('\n').map(String::from).collect();

    // Check if the file is read-only
    let metadata = fs::metadata(&file_path).map_err(|e| {
        format!(
            "Failed to get metadata for file {}: {}",
            file_path.display(),
            e
        )
    })?;
    let mut was_read_only = false;

    if metadata.permissions().readonly() {
        was_read_only = true;
        // Make the file writable
        let mut permissions = metadata.permissions();
        permissions.set_readonly(false);
        fs::set_permissions(&file_path, permissions).map_err(|e| {
            format!(
                "Failed to set permissions for file {}: {}",
                file_path.display(),
                e
            )
        })?;
    }

    for (key, new_value) in changes {
        // Capitalize boolean values
        let formatted_value = if new_value == "true" || new_value == "false" {
            let mut chars = new_value.chars();
            chars.next().unwrap().to_uppercase().collect::<String>() + chars.as_str()
        } else {
            new_value
        };

        // Update all occurrences of the key (Used for instances such as force static terrain which appear multiple times)
        for line in lines.iter_mut() {
            if line.starts_with(&format!("{}=", key)) {
                *line = format!("{}={}", key, formatted_value);
            }
        }
    }

    content = lines.join("\n");
    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write to file {}: {}", file_path.display(), e))?;

    // Restore the read-only permission if it was initially read-only
    if was_read_only {
        let mut permissions = fs::metadata(&file_path)
            .map_err(|e| e.to_string())?
            .permissions();
        permissions.set_readonly(true);
        fs::set_permissions(&file_path, permissions).map_err(|e| {
            format!(
                "Failed to restore permissions for file {}: {}",
                file_path.display(),
                e
            )
        })?;
    }

    Ok(())
}

/// Read the content and permissions of a config file.
fn read_config_file(path: &PathBuf) -> Result<ConfigFile, String> {
    Ok(ConfigFile {
        content: read_file(path)?,
        permissions: get_permissions(path)?,
    })
}

/// Read the content of a file.
fn read_file(path: &PathBuf) -> Result<String, String> {
    let mut file = fs::File::open(path)
        .map_err(|e| format!("Failed to open file {}: {}", path.display(), e))?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|e| format!("Failed to read file {}: {}", path.display(), e))?;
    Ok(content)
}

/// Get the permissions of a file.
fn get_permissions(path: &PathBuf) -> Result<String, String> {
    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to get metadata for {}: {}", path.display(), e))?;
    let permissions = metadata.permissions();
    Ok(if permissions.readonly() {
        "readonly"
    } else {
        "read-write"
    }
    .to_string())
}
