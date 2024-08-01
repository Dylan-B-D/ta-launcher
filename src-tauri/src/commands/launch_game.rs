use std::fs;

use async_process::Command;
use tauri::Emitter;
use crate::commands::data::{get_app_local_data_dir, get_game_folder, get_launcher_config_file, get_original_dlls_dir};
use super::data::{LOGIN_SERVER_PUG,LOGIN_SERVER_COMMUNITY};

/// Launch the game with the specified configuration.
/// 
/// Finds the game executable, login server, original DLLs, and the chosen TAMods DLL.
/// Finds all matches of original DLLs from the ..public/originalDLLs folder in the game folder and hijacks them with the chosen TAMods DLL.
/// Launches the game with the specified login server.
/// Reverts the hijacked DLLs back to their original content when the game exits.
/// 
/// # Arguments
/// 
/// * `handle` - The AppHandle object
/// 
/// # Returns
/// 
/// * `Result<(), String>` - An empty result or an error message
/// 
/// # Emit
/// 
/// * `game-launched` - When the game has been launched
/// * `game-exited` - When the game has exited
#[tauri::command]
pub async fn launch_game(handle: tauri::AppHandle) -> Result<(), String> {

    let config = get_launcher_config_file(&handle)?;
    let game_path = config["gamePath"].as_str().ok_or("Game path not found")?;
    let launch_method = config["launchMethod"].as_str().ok_or("Launch method not found")?;
    let dll_version = config["dllVersion"].as_str().ok_or("DLL version not found")?;
    let login_server = config["loginServer"].as_str().ok_or("Login server not found")?;

    // Get the paths
    let original_dll_path = get_original_dlls_dir(&handle)?;    // Contains list of DLLs to Hijack
    let game_folder = get_game_folder(&handle); // Path to DLLs to Hijack
    let app_data_dir = get_app_local_data_dir(&handle);         // Path to TAMods DLLs that will Hijack the game DLLs

    // Get DLL based what is selected in the config file by the user
    let tamods_dll_name = match dll_version {
        "Release" => "TAMods.dll",
        "Beta" => "tamods-beta.dll",
        "Edge" => "tamods-edge.dll",
        _ => return Err("Invalid DLL version".to_string()),
    };
    let tamods_dll_path = app_data_dir.join("dlls").join(tamods_dll_name);

    // Read the content of the chosen TAMods DLL
    let tamods_dll_content = fs::read(&tamods_dll_path)
        .map_err(|e| format!("Failed to read TAMods DLL: {}", e))?;

    // Get all DLL names from the originalDLLs folder
    let original_dlls = fs::read_dir(&original_dll_path)
        .map_err(|e| format!("Failed to read originalDLLs directory: {}", e))?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                if path.extension() == Some(std::ffi::OsStr::new("dll")) {
                    path.file_name().map(|n| n.to_string_lossy().to_string())
                } else {
                    None
                }
            })
        })
        .collect::<Vec<String>>();

    // Replace the content of matching DLLs in the game folder
    let mut replaced_dlls = Vec::new();
    for dll_name in &original_dlls {
        let game_dll_path = match game_folder {
            Ok(ref folder) => folder.join(dll_name),
            Err(err) => return Err(format!("Failed to get game folder: {}", err)),
        };
        if game_dll_path.exists() {
            // Backup the original DLL content
            let original_content = fs::read(&game_dll_path)
                .map_err(|e| format!("Failed to read game DLL {}: {}", dll_name, e))?;
            replaced_dlls.push((game_dll_path.clone(), original_content));

            // Replace with TAMods DLL content
            fs::write(&game_dll_path, &tamods_dll_content)
                .map_err(|e| format!("Failed to replace game DLL {}: {}", dll_name, e))?;
        }
    }

    // Get the login server based on the config file
    let login_server_arg = match login_server {
        "PUG" => format!("-hostx={}", LOGIN_SERVER_PUG),
        "Community" => format!("-hostx={}", LOGIN_SERVER_COMMUNITY),
        "Custom" => format!("-hostx={}", config["customServerIP"].as_str().ok_or("Custom login server not found")?),
        _ => return Err("Invalid login server".to_string()),
    };

    // Launch the game
    if launch_method == "Non-Steam" {
        let mut command = Command::new(game_path);
        command.arg(login_server_arg);

        // Add any other necessary arguments here

        match command.spawn() {
            Ok(mut child) => {
                // Emit an event to the frontend indicating the game has launched
                handle.emit("game-launched", true)
                    .map_err(|e| format!("Failed to emit game-launched event: {}", e))?;
        
                // Spawn a new task to monitor the child process and emit an event when it exits
                let handle_clone = handle.clone();
                tauri::async_runtime::spawn(async move {
                    match child.status().await {
                        Ok(status) => {
                            // Revert the DLLs
                            for (path, content) in replaced_dlls {
                                if let Err(e) = fs::write(&path, content) {
                                    eprintln!("Failed to revert DLL {}: {}", path.display(), e);
                                }
                            }
        
                            if let Err(e) = handle_clone.emit("game-exited", status.success()) {
                                eprintln!("Failed to emit game-exited event: {}", e);
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to wait for child process: {}", e);
                            // Still attempt to revert DLLs even if there was an error
                            for (path, content) in replaced_dlls {
                                if let Err(e) = fs::write(&path, content) {
                                    eprintln!("Failed to revert DLL {}: {}", path.display(), e);
                                }
                            }
                            if let Err(e) = handle_clone.emit("game-exited", false) {
                                eprintln!("Failed to emit game-exited event: {}", e);
                            }
                        }
                    }
                });
        
                Ok(())
            },
            Err(e) => Err(format!("Failed to launch game: {}", e)),
        }
    } else {
        // Implement Steam launch method here when needed
        Err("Steam launch method not implemented yet".to_string())
    }
}