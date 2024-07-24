use std::fs::{self, copy, create_dir_all};
use std::io::Read;
use std::path::PathBuf;
use tauri::{path::BaseDirectory, Manager};
use dirs;

#[tauri::command]
pub fn fetch_config_files(handle: tauri::AppHandle) -> Result<ConfigFilesResult, String> {
    let documents_dir = dirs::document_dir().ok_or_else(|| "Could not find documents directory".to_string())?;
    let config_dir = documents_dir.join("My Games\\Tribes Ascend\\TribesGame\\config");

    let tribes_ini_path = config_dir.join("tribes.ini");
    let tribes_input_ini_path = config_dir.join("TribesInput.ini");
    let default_input_ini_path = handle.path().resolve(
        "..\\public\\configs\\defaultinput\\TribesInput.ini",
        BaseDirectory::Resource
    ).map_err(|e| e.to_string())?;
    let default_ini_path = handle.path().resolve(
        "../public/configs/defaultini/tribes.ini",
        BaseDirectory::Resource
    ).map_err(|e| e.to_string())?;

    if !default_input_ini_path.exists() {
        return Err(format!("Default Input INI file not found: {}", default_input_ini_path.display()));
    }

    if !default_ini_path.exists() {
        return Err(format!("Default INI file not found: {}", default_ini_path.display()));
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
