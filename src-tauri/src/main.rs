// main.rs

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
use commands::{inject_command, launch_game_command, fetch_players_command, fetch_package_metadata_command};
// Add these to your existing imports
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Package {
    id: String,
    displayName: String,
    description: String,
    version: String,
    objectKey: String,
    required: bool,
    dependencies: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct PackageConfig {
    packages: Vec<Package>,
}

#[tauri::command]
async fn fetch_packages() -> Result<String, String> {
    let yaml_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/packageconfig.yaml";
    let response = reqwest::get(yaml_url).await.map_err(|e| e.to_string())?;
    let yaml_content = response.text().await.map_err(|e| e.to_string())?;

    println!("YAML Content: \n{}", yaml_content);

    let packages: PackageConfig = serde_yaml::from_str(&yaml_content)
        .map_err(|e| e.to_string())?;

    serde_json::to_string(&packages)
        .map_err(|e| e.to_string())
}

fn main() {
    // Tauri app builder and run
    tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        inject_command::inject, 
        launch_game_command::launch_game,
        fetch_players_command::fetch_players_online, 
        fetch_package_metadata_command::fetch_package_metadata,
        fetch_packages,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

}
