use async_process::Command;
use serde_json::Value;
use tauri::{AppHandle, Emitter};

use super::constants::{LOGIN_SERVER_PUG,LOGIN_SERVER_COMMUNITY};

#[tauri::command]
pub async fn launch_game(config: Value, app_handle: AppHandle) -> Result<(), String> {
    let game_path = config["gamePath"].as_str().ok_or("Game path not found")?;
    let launch_method = config["launchMethod"].as_str().ok_or("Launch method not found")?;
    let _dll_version = config["dllVersion"].as_str().ok_or("DLL version not found")?;
    let login_server = config["loginServer"].as_str().ok_or("Login server not found")?;

    let login_server_arg = match login_server {
        "PUG" => format!("-hostx={}", LOGIN_SERVER_PUG),
        "Community" => format!("-hostx={}", LOGIN_SERVER_COMMUNITY),
        "Custom" => format!("-hostx={}", config["customLoginServer"].as_str().ok_or("Custom login server not found")?),
        _ => return Err("Invalid login server".to_string()),
    };

    if launch_method == "Non-Steam" {
        let mut command = Command::new(game_path);
        command.arg(login_server_arg);

        // Add any other necessary arguments here

        match command.spawn() {
            Ok(mut child) => {
                // Emit an event to the frontend indicating the game has launched
                app_handle.emit("game-launched", true)
                    .map_err(|e| format!("Failed to emit game-launched event: {}", e))?;

                // Spawn a new task to monitor the child process and emit an event when it exits
                tauri::async_runtime::spawn(async move {
                    match child.status().await {
                        Ok(status) => {
                            if let Err(e) = app_handle.emit("game-exited", status.success()) {
                                eprintln!("Failed to emit game-exited event: {}", e);
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to wait for child process: {}", e);
                            if let Err(e) = app_handle.emit("game-exited", false) {
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