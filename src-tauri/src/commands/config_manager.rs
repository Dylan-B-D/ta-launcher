use std::fs::{self, copy, create_dir_all};
use std::io::Read;
use std::path::PathBuf;
use tauri::{path::BaseDirectory, Manager};
use dirs;

#[derive(serde::Serialize)]
pub struct ConfigFile {
    content: String,
    permissions: String,
}

#[derive(serde::Serialize)]
pub struct ConfigFilesResult {
    tribes_ini: ConfigFile,
    tribes_input_ini: ConfigFile,
}

#[tauri::command]
pub fn fetch_config_files(handle: tauri::AppHandle) -> Result<ConfigFilesResult, String> {
    let documents_dir = dirs::document_dir().ok_or_else(|| "Could not find documents directory".to_string())?;
    let config_dir = documents_dir.join("My Games\\Tribes Ascend\\TribesGame\\config");

    let tribes_ini_path = config_dir.join("tribes.ini");
    let tribes_input_ini_path = config_dir.join("TribesInput.ini");
    let help_text_ini_path = config_dir.join("TribesHelpText.ini");
    let tribes_user_ini_path = config_dir.join("TribesUser.ini");
    let default_input_ini_path = handle.path().resolve(
        "..\\public\\configs\\defaultinput\\TribesInput.ini",
        BaseDirectory::Resource
    ).map_err(|e| e.to_string())?;
    let default_ini_path = handle.path().resolve(
        "../public/configs/defaultini/tribes.ini",
        BaseDirectory::Resource
    ).map_err(|e| e.to_string())?;
    let default_help_text_ini_path = handle.path().resolve(
        "../public/configs/defaulttribeshelptext/TribesHelpText.ini",
        BaseDirectory::Resource
    ).map_err(|e| e.to_string())?;
    let default_user_ini_path = handle.path().resolve(
        "../public/configs/defaulttribesuser/TribesUser.ini",
        BaseDirectory::Resource
    ).map_err(|e| e.to_string())?;

    if !default_input_ini_path.exists() {
        return Err(format!("Default Input INI file not found: {}", default_input_ini_path.display()));
    }

    if !default_ini_path.exists() {
        return Err(format!("Default INI file not found: {}", default_ini_path.display()));
    }

    if !default_help_text_ini_path.exists() {
        return Err(format!("Default Help Text INI file not found: {}", default_help_text_ini_path.display()));
    }

    if !default_user_ini_path.exists() {
        return Err(format!("Default User INI file not found: {}", default_user_ini_path.display()));
    }

    // Ensure the config directory exists
    if !config_dir.exists() {
        create_dir_all(&config_dir).map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    // Check and copy default TribesInput.ini if it does not exist
    if !tribes_input_ini_path.exists() {
        copy(&default_input_ini_path, &tribes_input_ini_path).map_err(|e| e.to_string())?;
    }
    // Check and copy default tribes.ini if it does not exist
    if !tribes_ini_path.exists() {
        copy(&default_ini_path, &tribes_ini_path).map_err(|e| e.to_string())?;
    }

    // Check and copy default TribesHelpText.ini if it does not exist
    if !help_text_ini_path.exists() {
        copy(&default_help_text_ini_path, &help_text_ini_path).map_err(|e| e.to_string())?;
    }

    // Check and copy default TribesUser.ini if it does not exist
    if !tribes_user_ini_path.exists() {
        copy(&default_user_ini_path, &tribes_user_ini_path).map_err(|e| e.to_string())?;
    }

    let tribes_ini_content = read_file(&tribes_ini_path)?;
    let tribes_ini_permissions = get_permissions(&tribes_ini_path)?;

    let tribes_input_ini_content = read_file(&tribes_input_ini_path)?;
    let tribes_input_ini_permissions = get_permissions(&tribes_input_ini_path)?;

    Ok(ConfigFilesResult {
        tribes_ini: ConfigFile {
            content: tribes_ini_content,
            permissions: tribes_ini_permissions,
        },
        tribes_input_ini: ConfigFile {
            content: tribes_input_ini_content,
            permissions: tribes_input_ini_permissions,
        },
    })
}

fn read_file(path: &PathBuf) -> Result<String, String> {
    let mut file = fs::File::open(path).map_err(|e| format!("Failed to open file {}: {}", path.display(), e))?;
    let mut content = String::new();
    file.read_to_string(&mut content).map_err(|e| format!("Failed to read file {}: {}", path.display(), e))?;
    Ok(content)
}

fn get_permissions(path: &PathBuf) -> Result<String, String> {
    let metadata = fs::metadata(path).map_err(|e| format!("Failed to get metadata for {}: {}", path.display(), e))?;
    let permissions = metadata.permissions();
    Ok(if permissions.readonly() { "readonly" } else { "read-write" }.to_string())
}

#[tauri::command]
pub fn update_ini_file(file: String, changes: Vec<(String, String)>) -> Result<(), String> {
    let documents_dir = dirs::document_dir().ok_or_else(|| "Could not find documents directory".to_string())?;
    let config_dir = documents_dir.join("My Games\\Tribes Ascend\\TribesGame\\config");
    let file_path = config_dir.join(file);

    let mut content = read_file(&file_path)?;
    let mut lines: Vec<String> = content.split('\n').map(String::from).collect();

    // Check if the file is read-only
    let metadata = fs::metadata(&file_path).map_err(|e| format!("Failed to get metadata for file {}: {}", file_path.display(), e))?;
    let mut was_read_only = false;

    if metadata.permissions().readonly() {
        was_read_only = true;
        // Make the file writable
        let mut permissions = metadata.permissions();
        permissions.set_readonly(false);
        fs::set_permissions(&file_path, permissions).map_err(|e| format!("Failed to set permissions for file {}: {}", file_path.display(), e))?;
    }

    for (key, new_value) in changes {
        // Capitalize boolean values
        let formatted_value = if new_value == "true" || new_value == "false" {
            let mut chars = new_value.chars();
            chars.next().unwrap().to_uppercase().collect::<String>() + chars.as_str()
        } else {
            new_value
        };

        // Update all occurrences of the key
        for line in lines.iter_mut() {
            if line.starts_with(&format!("{}=", key)) {
                *line = format!("{}={}", key, formatted_value);
            }
        }
    }

    content = lines.join("\n");
    fs::write(&file_path, content).map_err(|e| format!("Failed to write to file {}: {}", file_path.display(), e))?;

    // Restore the read-only permission if it was initially read-only
    if was_read_only {
        let mut permissions = fs::metadata(&file_path).map_err(|e| e.to_string())?.permissions();
        permissions.set_readonly(true);
        fs::set_permissions(&file_path, permissions).map_err(|e| format!("Failed to restore permissions for file {}: {}", file_path.display(), e))?;
    }

    Ok(())
}