use super::data::{get_tribes_dir, LOGIN_SERVER_COMMUNITY, LOGIN_SERVER_PUG, TRIBES_STEAM_ID};
use crate::commands::data::{
    get_app_local_data_dir, get_game_folder, get_launcher_config_file, get_original_dlls_dir,
};
use async_process::Command;
use log::info;
use std::fs;
use std::path::PathBuf;
use sysinfo::System;
use tauri::Emitter;
use winreg::enums::*;
use winreg::RegKey;

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
    info!("Launching game...");

    let config = get_launcher_config_file(&handle)?;
    info!("Configuration file loaded.");

    let game_path = config["gamePath"].as_str().ok_or("Game path not found")?;
    info!("Game path: {}", game_path);

    let launch_method = config["launchMethod"]
        .as_str()
        .ok_or("Launch method not found")?;
    info!("Launch method: {}", launch_method);

    let dll_version = config["dllVersion"]
        .as_str()
        .ok_or("DLL version not found")?;
    info!("DLL version: {}", dll_version);

    let login_server = config["loginServer"]
        .as_str()
        .ok_or("Login server not found")?;
    info!("Login server: {}", login_server);

    // Get launch arguments from config
    let launch_args = config["launchArgs"].as_str().unwrap_or("").trim();
    let launch_args: Vec<&str> = if !launch_args.is_empty() {
        launch_args.split(',').map(|s| s.trim()).collect()
    } else {
        Vec::new()
    };
    info!("Launch arguments: {:?}", launch_args);

    // Get the paths
    let original_dll_path = get_original_dlls_dir(&handle)?;
    info!("Original DLLs path: {:?}", original_dll_path);

    let game_folder = get_game_folder(&handle);
    info!("Game folder: {:?}", game_folder);

    let app_data_dir = get_app_local_data_dir(&handle);
    info!("App data directory: {:?}", app_data_dir);

    let tamods_dll_content = match dll_version {
        "Release" => {
            let path = app_data_dir.join("dlls").join("TAMods.dll");
            info!("TAMods Release DLL path: {:?}", path);
            fs::read(&path).map_err(|e| format!("Failed to read Release TAMods DLL: {}", e))?
        }
        "Beta" => {
            let path = app_data_dir.join("dlls").join("tamods-beta.dll");
            info!("TAMods Beta DLL path: {:?}", path);
            fs::read(&path).map_err(|e| format!("Failed to read Beta TAMods DLL: {}", e))?
        }
        "Edge" => {
            let path = app_data_dir.join("dlls").join("tamods-edge.dll");
            info!("TAMods Edge DLL path: {:?}", path);
            fs::read(&path).map_err(|e| format!("Failed to read Edge TAMods DLL: {}", e))?
        }
        "Custom" => {
            let custom_dll_path = config["customDLLPath"]
                .as_str()
                .ok_or("Custom DLL path not found")?;
            let path = std::path::PathBuf::from(custom_dll_path);
            info!("Custom DLL path: {:?}", path);
            fs::read(&path).map_err(|e| format!("Failed to read Custom DLL: {}", e))?
        }
        "None" => Vec::new(), // No DLL injection, just launch the game
        _ => return Err("Invalid DLL version".to_string()),
    };

    // Replace the content of matching DLLs in the game folder with the chosen TAMods DLL if DLL version != "None"
    if dll_version != "None" {
        let mut replaced_dlls = Vec::new();
    
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
        info!("Original DLLs found: {:?}", original_dlls);
    
        // Replace the content of matching DLLs in the game folder
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
        info!("DLLs replaced.");
    }

    let login_server_arg = match login_server {
        "PUG" => format!("-hostx={}", LOGIN_SERVER_PUG),
        "Community" => format!("-hostx={}", LOGIN_SERVER_COMMUNITY),
        "Custom" => format!(
            "-hostx={}",
            config["customServerIP"]
                .as_str()
                .ok_or("Custom login server not found")?
        ),
        _ => return Err("Invalid login server".to_string()),
    };
    info!("Login server argument: {}", login_server_arg);

    match launch_method {
        "Non-Steam" => {
            info!("Launching Non-Steam version of the game...");
            let mut command = Command::new(game_path);
            command.arg(login_server_arg);

            for arg in launch_args {
                command.arg(arg);
            }

            match command.spawn() {
                Ok(mut child) => {
                    info!("Game launched successfully.");
                    handle
                        .emit("game-launched", true)
                        .map_err(|e| format!("Failed to emit game-launched event: {}", e))?;

                    let handle_clone = handle.clone();
                    tauri::async_runtime::spawn(async move {
                        match child.status().await {
                            Ok(status) => {
                                info!("Game exited with status: {}", status.success());
                                if let Err(e) = restore_original_dlls(
                                    original_dll_path,
                                    game_folder.clone().unwrap(),
                                ) {
                                    eprintln!("Failed to restore original DLLs: {}", e);
                                }

                                if let Err(e) = handle_clone.emit("game-exited", status.success()) {
                                    eprintln!("Failed to emit game-exited event: {}", e);
                                }
                            }
                            Err(e) => {
                                eprintln!("Failed to wait for child process: {}", e);
                                if let Err(e) = restore_original_dlls(
                                    original_dll_path,
                                    game_folder.clone().unwrap(),
                                ) {
                                    eprintln!("Failed to restore original DLLs: {}", e);
                                }
                                if let Err(e) = handle_clone.emit("game-exited", false) {
                                    eprintln!("Failed to emit game-exited event: {}", e);
                                }
                            }
                        }
                    });

                    Ok(())
                }
                Err(e) => {
                    eprintln!("Failed to launch game: {}", e);
                    Err(format!("Failed to launch game: {}", e))
                },
            }
        }
        "Steam" => {
            info!("Launching Steam version of the game...");
            if let Err(e) = modify_install_script(handle.clone()) {
                eprintln!("{}", e);
            }

            let steam_path = if cfg!(target_os = "windows") {
                match find_steam_path() {
                    Ok(path) => path + "\\steam.exe",
                    Err(e) => {
                        eprintln!("Failed to find Steam path: {}", e);
                        "C:\\Program Files (x86)\\Steam\\steam.exe".to_string()
                    }
                }
            } else {
                "/usr/bin/steam".to_string()
            };
            info!("Steam path: {}", steam_path);

            let tribes_steam_id_str = TRIBES_STEAM_ID.to_string();
            let mut args = vec!["-applaunch", &tribes_steam_id_str, &login_server_arg];
            args.extend(launch_args.iter().map(|&s| s));
            info!("Steam launch arguments: {:?}", args);

            match Command::new(steam_path).args(args).spawn() {
                Ok(_) => {
                    info!("Game launched successfully through Steam.");
                    handle
                        .emit("game-launched", true)
                        .map_err(|e| format!("Failed to emit game-launched event: {}", e))?;

                    let handle_clone = handle.clone();
                    tauri::async_runtime::spawn(async move {
                        std::thread::sleep(std::time::Duration::from_secs(5));

                        loop {
                            if !is_game_running() {
                                info!("Game is no longer running.");
                                if let Err(e) = restore_original_dlls(
                                    original_dll_path,
                                    game_folder.clone().unwrap(),
                                ) {
                                    eprintln!("Failed to restore original DLLs: {}", e);
                                }

                                if let Err(e) = handle_clone.emit("game-exited", true) {
                                    eprintln!("Failed to emit game-exited event: {}", e);
                                }
                                break;
                            }
                            std::thread::sleep(std::time::Duration::from_secs(5));
                        }
                    });

                    Ok(())
                }
                Err(e) => {
                    eprintln!("Failed to launch game through Steam: {}", e);
                    Err(format!("Failed to launch game through Steam: {}", e))
                },
            }
        }
        _ => {
            println!("Invalid launch method specified.");
            Err("Invalid launch method".to_string())
        },
    }
}


/// Check if the game is running.
///
/// # Returns
///
/// * `bool` - True if the game is running, false otherwise
fn is_game_running() -> bool {
    let mut system = System::new_all();
    system.refresh_all();

    system
        .processes()
        .values()
        .any(|process| process.name().to_ascii_lowercase() == "tribesascend.exe")
}

/// Modify the InstallScript to remove the PreReqPatcher section.
///
/// This section causes InstallShield popups and UAC prompts when launching the game through Steam.
///
/// # Arguments
///
/// * `handle` - The AppHandle object
///
/// # Returns
///
/// * `Result<(), String>` - An empty result or an error message
fn modify_install_script(handle: tauri::AppHandle) -> Result<(), String> {
    let tribes_dir = get_tribes_dir(&handle)?;
    let install_script_path = tribes_dir.join("installscript.vdf");

    // Modify the InstallScript to remove the PreReqPatcher section
    if let Ok(mut script_content) = fs::read_to_string(&install_script_path) {
        // Find and remove the "PreReqPatcher" block from the script
        if let Some(start_index) = script_content.find("\"PreReqPatcher\"") {
            if let Some(end_index) = script_content[start_index..]
                .find("}")
                .map(|i| start_index + i + 1)
            {
                script_content.replace_range(start_index..end_index, "");
            }
        }

        // Save the modified script back to the file
        if let Err(e) = fs::write(&install_script_path, script_content) {
            return Err(format!("Failed to modify InstallScript: {}", e));
        }
    } else {
        return Err("Failed to read InstallScript".to_string());
    }

    Ok(())
}

/// Find the Steam installation path from the registry.
///
/// # Returns
///
/// * `Result<String, String>` - The Steam installation path or an error message
fn find_steam_path() -> Result<String, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let steam_key = hklm
        .open_subkey("SOFTWARE\\WOW6432Node\\Valve\\Steam")
        .or_else(|_| hklm.open_subkey("SOFTWARE\\Valve\\Steam"))
        .map_err(|e| format!("Failed to open Steam registry key: {}", e))?;

    let install_path: String = steam_key
        .get_value("InstallPath")
        .map_err(|e| format!("Failed to get Steam installation path: {}", e))?;

    Ok(install_path)
}

/// Restore the original DLLs from the originalDLLs folder to the game folder on game exit.
///
/// # Arguments
///
/// * `original_dll_path` - Path to the directory containing the original DLLs.
/// * `game_folder` - Path to the game folder where the DLLs should be restored.
fn restore_original_dlls(original_dll_path: PathBuf, game_folder: PathBuf) -> Result<(), String> {
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

    // Replace the content of matching DLLs in the game folder with the ones from the originalDLLs folder
    for dll_name in &original_dlls {
        let original_dll_file = original_dll_path.join(dll_name);
        let game_dll_file = game_folder.join(dll_name);

        if game_dll_file.exists() && original_dll_file.exists() {
            // Read the original DLL content
            let original_content = fs::read(&original_dll_file)
                .map_err(|e| format!("Failed to read original DLL {}: {}", dll_name, e))?;

            // Replace the game DLL with the original DLL content
            fs::write(&game_dll_file, &original_content)
                .map_err(|e| format!("Failed to replace game DLL {}: {}", dll_name, e))?;
        }
    }

    Ok(())
}
