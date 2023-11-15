// downloader_command.rs

use std::path::PathBuf;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use std::env;
use tokio::io::AsyncWriteExt;


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Progress {
    pub package_id: String,
    pub filesize: u64,
    pub transfered: u64,
    pub transfer_rate: f64,
    pub percentage: f64,
}


impl Progress {
    pub fn emit_progress(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_PROGRESS", &self).ok();
    }

    pub fn emit_finished(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_FINISHED", &self).ok();
    }
}

// New function to determine download path based on package type
fn determine_download_path(package_id: &str) -> Result<PathBuf, String> {
    let username = env::var("USERNAME").unwrap_or_else(|_| "default".into());
    let tribes_path = PathBuf::from(format!(r"C:\Users\{}\Documents\My Games\Tribes Ascend\TribesGame", username));
    let ta_launcher_path = tribes_path.join("TALauncher");

    // Check package type and return the corresponding path
    match package_id {
        id if id.contains("dll") => Ok(ta_launcher_path.clone()),
        id if id.contains("game_files") => Ok(ta_launcher_path.join("Game Files")), // Adjusted path for game_files
        id if id.contains("config") => Ok(tribes_path.join("Tribes Config")),
        _ => Err("Unrecognized package type".to_string()),
    }
}


#[tauri::command]
pub async fn download_package(
    package_id: String, 
    filesize: u64, // Pass filesize as a parameter
    handle: tauri::AppHandle // Pass the app handle to emit events
) -> Result<String, String> {
    let base_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/";

    // Check if the package_id contains 'dll'
    let object_key = if package_id.contains("dll") {
        format!("packages/{}.zip", package_id)
    } else {
        return Err("Package not recognized".to_string());
    };

    let download_url = format!("{}{}", base_url, object_key);
    println!("Download url: {}", download_url);

    let download_path = determine_download_path(&package_id)?;

    let file_path = download_path.join(object_key.split('/').last().unwrap());
    println!("File Path: {:?}", file_path);

    // Initialize progress tracking
    let mut progress = Progress {
        package_id: package_id.clone(),
        filesize,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0,
    };

    // Start the download
    let response = reqwest::get(&download_url).await.map_err(|e| e.to_string())?;
    let mut stream = response.bytes_stream();

    let start = std::time::Instant::now();
    let mut last_update = start;

    // Create a temporary path for the zip file
    let temp_dir = tempfile::tempdir().map_err(|e| e.to_string())?;
    let temp_zip_path = temp_dir.path().join("temp_package.zip");
    let mut temp_zip_file = tokio::fs::File::create(&temp_zip_path).await.map_err(|e| e.to_string())?;

    // Stream and write the download
    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        progress.transfered += chunk.len() as u64;
        temp_zip_file.write_all(&chunk).await.map_err(|e| e.to_string())?;

        // Update progress
        progress.percentage = (progress.transfered as f64 * 100.0) / filesize as f64;
        progress.transfer_rate = (progress.transfered as f64) / (start.elapsed().as_secs_f64());

        // Emit progress periodically
        if last_update.elapsed().as_millis() >= 50 { // UPDATE_SPEED = 50ms
            progress.emit_progress(&handle);
            last_update = std::time::Instant::now();
        }
    }

    // Emit final progress
    progress.emit_finished(&handle);

    // Open the zip file
    let zip_file = std::fs::File::open(&temp_zip_path).map_err(|e| e.to_string())?;
    let mut zip_archive = zip::ZipArchive::new(zip_file).map_err(|e| e.to_string())?;

    // Iterate over each file & directory and extract
    for i in 0..zip_archive.len() {
        let mut file = zip_archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = download_path.join(file.mangled_name());

        if (&*file.name()).ends_with('/') {
            std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(&p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = std::fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    // Optionally, clean up the temporary zip file
    temp_dir.close().map_err(|e| e.to_string())?;

    Ok(format!("Extracted to {:?}", download_path))
}

