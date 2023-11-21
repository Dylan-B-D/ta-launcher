use tauri::command;
use directories::UserDirs;
use std::fs;

#[command]
pub fn get_available_dlls() -> Result<Vec<String>, String> {
    let user_dirs = UserDirs::new().ok_or("Unable to find user directories")?;
    let documents_path = user_dirs.document_dir().ok_or("Unable to find documents directory")?;
    let packages_path = documents_path.join("My Games/Tribes Ascend/TribesGame/TALauncher");

    if !packages_path.exists() {
        return Err("Packages directory does not exist".into());
    }

    match fs::read_dir(packages_path) {
        Ok(entries) => {
            let dll_files = entries.filter_map(|entry| {
                let entry = entry.ok()?;
                let path = entry.path();
                if path.is_file() && path.extension()? == "dll" {
                    path.file_name()?.to_str().map(String::from)
                } else {
                    None
                }
            }).collect();
            Ok(dll_files)
        },
        Err(_) => Err("Failed to find TA Mods dlls, make sure to install via the package manager.".into()),
    }
}