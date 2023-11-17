// launch_game_command.rs

use std::io::{BufRead, BufReader};
use std::process::{Command, Child, Stdio};
use std::thread;
use tauri::{Window, Result};
use tokio::time::{sleep, Duration};

use crate::commands::util_command::is_process_running; 

#[derive(serde::Deserialize)]
pub struct LaunchOptions {
    exePath: Option<String>,
    launchArg: String,
}

#[tauri::command]
pub async fn launch_game(options: LaunchOptions, window: Window) -> Result<()> {
    let app_id = "17080"; // App ID for Tribes: Ascend on Steam
    let steam_url = format!("steam://rungameid/{}//{}", app_id, options.launchArg);

    Command::new("cmd")
        .args(["/C", "start", "", &steam_url])
        .spawn()?;

    let game_executable_name = "TribesAscend.exe";

    // Poll for the game process
    for _ in 0..30 { // Poll for up to 30 seconds
        if is_process_running(game_executable_name) {
            // Wait for 5 seconds before emitting the event
            sleep(Duration::from_secs(5)).await;
            window.emit("dll-injection-trigger", {}).expect("failed to emit event");
            break;
        }
        sleep(Duration::from_secs(1)).await;
    }

    Ok(())
}

#[tauri::command]
pub fn launch_game_non_steam(options: LaunchOptions, window: Window) -> Result<()> {
    let exe_path = options.exePath.unwrap_or_else(|| "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tribes\\Binaries\\Win32\\TribesAscend.exe".to_string());

    let mut child = Command::new(&exe_path)
        .args(["-hostx=Ta.dodgesdomain.com", &options.launchArg])
        .stdout(Stdio::piped())
        .spawn()?;

    handle_stdout_and_emit_event(&mut child, window)?;

    Ok(())
}

fn handle_stdout_and_emit_event(child: &mut Child, window: Window) -> Result<()> {
    let stdout = child.stdout.take().ok_or_else(|| std::io::Error::new(std::io::ErrorKind::Other, "Could not capture stdout"))?;
    
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                println!("{}", line); // Print each line
                if line.contains("Warning, Failed to load 'SwfMovie UDKFrontEnd.udk_ime'") {
                    window.emit("dll-injection-trigger", {}).expect("failed to emit event");
                    break; // Stop the loop
                }
            }
        }
    });

    Ok(())
}