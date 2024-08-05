use super::data::{get_app_local_data_dir, CONFIG_DIR};
use chrono::Local;
use serde::Serialize;
use std::{fs, io::ErrorKind, time::SystemTime};
use tauri::AppHandle;

/// Backup the INI files
#[tauri::command]
pub fn backup_ini_files(
    handle: AppHandle,
    backup_name: String,
    selected_files: Vec<String>,
) -> Result<(), String> {
    let backup_dir = get_app_local_data_dir(&handle).join("config_backups");
    let _ = fs::create_dir_all(&backup_dir);

    for file_name in selected_files {
        let source_path = CONFIG_DIR.join(&file_name);
        let dest_path = backup_dir.join(format!("{}_{}", backup_name, file_name));
        fs::copy(&source_path, &dest_path)
            .map_err(|err| format!("Failed to backup file {}: {}", file_name, err))?;
    }
    Ok(())
}

/// Load a backup INI file
#[tauri::command]
pub fn load_backup_ini_file(handle: AppHandle, backup_name: String) -> Result<(), String> {
    let backup_dir = get_app_local_data_dir(&handle).join("config_backups");

    for entry in fs::read_dir(&backup_dir)
        .map_err(|err| format!("Failed to read backup directory: {}", err))?
    {
        let entry = entry.map_err(|err| format!("Failed to read directory entry: {}", err))?;
        let file_name = entry.file_name();
        let file_name_str = file_name.to_string_lossy();
        if file_name_str.starts_with(&backup_name) {
            let source_path = backup_dir.join(&file_name);
            let dest_path = CONFIG_DIR.join(file_name_str.split('_').nth(1).unwrap());

            // Check if the destination file is read-only
            let dest_metadata = match fs::metadata(&dest_path) {
                Ok(metadata) => metadata,
                Err(e) if e.kind() == ErrorKind::NotFound => {
                    // File does not exist, no need to change permissions
                    fs::copy(&source_path, &dest_path)
                        .map_err(|err| format!("Failed to load backup file: {}", err))?;
                    continue;
                }
                Err(e) => {
                    return Err(format!(
                        "Failed to get metadata for {}: {}",
                        dest_path.display(),
                        e
                    ))
                }
            };

            let readonly = dest_metadata.permissions().readonly();
            if readonly {
                let mut perms = dest_metadata.permissions();
                perms.set_readonly(false);
                fs::set_permissions(&dest_path, perms).map_err(|err| {
                    format!(
                        "Failed to change permissions for {}: {}",
                        dest_path.display(),
                        err
                    )
                })?;
            }

            // Copy the file from the backup
            fs::copy(&source_path, &dest_path)
                .map_err(|err| format!("Failed to load backup file: {}", err))?;

            // Revert permissions if necessary
            if readonly {
                let mut perms = dest_metadata.permissions();
                perms.set_readonly(true);
                fs::set_permissions(&dest_path, perms).map_err(|err| {
                    format!(
                        "Failed to revert permissions for {}: {}",
                        dest_path.display(),
                        err
                    )
                })?;
            }
        }
    }
    Ok(())
}

/// Delete a backup
#[tauri::command]
pub fn delete_backup(handle: AppHandle, backup_name: String) -> Result<(), String> {
    let backup_dir = get_app_local_data_dir(&handle).join("config_backups");

    for entry in fs::read_dir(&backup_dir)
        .map_err(|err| format!("Failed to read backup directory: {}", err))?
    {
        let entry = entry.map_err(|err| format!("Failed to read directory entry: {}", err))?;
        let file_name = entry.file_name();
        let file_name_str = file_name.to_string_lossy();
        if file_name_str.starts_with(&backup_name) {
            let file_path = backup_dir.join(&file_name);

            // Check if the file is read-only and change permissions if necessary
            let metadata = fs::metadata(&file_path)
                .map_err(|err| format!("Failed to get file metadata: {}", err))?;
            if metadata.permissions().readonly() {
                let mut permissions = metadata.permissions();
                permissions.set_readonly(false);
                fs::set_permissions(&file_path, permissions)
                    .map_err(|err| format!("Failed to change file permissions: {}", err))?;
            }

            fs::remove_file(file_path)
                .map_err(|err| format!("Failed to delete backup file: {}", err))?;
        }
    }

    Ok(())
}

#[derive(Serialize)]
pub struct BackupInfo {
    name: String,
    modified: String,
}

/// Get list of backups with modification dates
#[tauri::command]
pub fn get_backups(handle: AppHandle) -> Result<Vec<BackupInfo>, String> {
    let backup_dir = get_app_local_data_dir(&handle).join("config_backups");
    let mut backup_files = Vec::new();

    if let Ok(entries) = fs::read_dir(&backup_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                if let Some(file_name) = entry.file_name().to_str() {
                    let metadata = fs::metadata(entry.path()).map_err(|e| e.to_string())?;
                    let modified = metadata.modified().unwrap_or(SystemTime::UNIX_EPOCH);
                    let modified_date = chrono::DateTime::<Local>::from(modified)
                        .format("%Y-%m-%d %H:%M")
                        .to_string();
                    backup_files.push(BackupInfo {
                        name: file_name.to_string(),
                        modified: modified_date,
                    });
                }
            }
        }
    }

    Ok(backup_files)
}
