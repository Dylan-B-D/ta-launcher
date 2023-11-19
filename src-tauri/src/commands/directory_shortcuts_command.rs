use std::process::Command;
use std::path::PathBuf;
use directories::UserDirs;

fn open_directory(path: &PathBuf) -> Result<(), String> {
    // Convert the path to its canonical form, if possible
    let canonical_path = path.canonicalize().map_err(|e| e.to_string())?;

    // Format the path for the command line
    let path_str = canonical_path.to_str().ok_or("Path conversion error")?;
    
    // Launch explorer with the path
    Command::new("explorer")
        .arg(path_str)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn get_documents_subfolder_path(relative_path: &str) -> Result<PathBuf, String> {
    let user_dirs = UserDirs::new().ok_or("Unable to find user directories")?;
    let documents_dir = user_dirs.document_dir().ok_or("Unable to find documents directory")?;
    Ok(documents_dir.join(relative_path))
}

#[tauri::command]
pub fn open_config_dir() -> Result<(), String> {
    let config_dir = get_documents_subfolder_path("My Games/Tribes Ascend/TribesGame/config")?;
    open_directory(&config_dir)
}

#[tauri::command]
pub fn open_routes_sub_dir() -> Result<(), String> {
    let routes_dir = get_documents_subfolder_path("My Games/Tribes Ascend/TribesGame/config/routes")?;
    open_directory(&routes_dir)
}

#[tauri::command]
pub fn open_hud_modules_sub_dir() -> Result<(), String> {
    let hud_modules_dir = get_documents_subfolder_path("My Games/Tribes Ascend/TribesGame/config/presets/ubermenu/hudmodules")?;
    open_directory(&hud_modules_dir)
}

#[tauri::command]
pub fn open_launcher_dir() -> Result<(), String> {
    let launcher_dir = get_documents_subfolder_path("My Games/Tribes Ascend/TribesGame/TALauncher")?;
    open_directory(&launcher_dir)
}