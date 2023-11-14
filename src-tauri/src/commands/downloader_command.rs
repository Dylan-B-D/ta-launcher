// downloader_command.rs

use std::path::PathBuf;
use tauri::api::path::download_dir;
use std::env;

#[tauri::command]
pub async fn download_package(package_id: String) -> Result<String, String> {
    let base_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/";
    let object_key = match package_id.as_str() {
        "tamods-dll" => "packages/tamods-dll.zip",
        _ => return Err("Package not recognized".to_string()),
    };

    let download_url = format!("{}{}", base_url, object_key);
    println!("Download url: {}", download_url);

    // Define download path
    let download_path = if cfg!(target_os = "windows") {
        PathBuf::from(env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".into()))
            .join("Downloads")
    } else {
        download_dir().unwrap_or_else(|| PathBuf::from("downloads"))
    };

    // Append each part of the object_key to the file_path
    let file_path = download_path.join(object_key.split('/').last().unwrap());

    
    println!("File Path: {:?}", file_path);

    // Perform the download
    let response = reqwest::get(&download_url).await.map_err(|e| e.to_string())?;
    let content = response.bytes().await.map_err(|e| e.to_string())?;
    tokio::fs::write(&file_path, &content).await.map_err(|e| e.to_string())?;

    Ok(format!("Downloaded to {:?}", file_path))
}

