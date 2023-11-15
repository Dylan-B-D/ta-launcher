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


// Adjusted function to determine download path based on package type
fn determine_download_path(package_id: &str) -> Result<PathBuf, String> {
    let username = env::var("USERNAME").unwrap_or_else(|_| "default".into());
    let tribes_path = PathBuf::from(format!(r"C:\Users\{}\Documents\My Games\Tribes Ascend\TribesGame", username));
    let ta_launcher_path = tribes_path.join("TALauncher");

    // Check package type and return the corresponding path
    match package_id {
        id if id.contains("dll") => Ok(ta_launcher_path.clone()),
        id if id.contains("map") => Ok(ta_launcher_path.join("Game Files")),
        id if id.contains("refshadercache") => Ok(ta_launcher_path.join("Game Files")),
        id if id.contains("treacherous") => Ok(ta_launcher_path.join("Game Files")),
        id if id.contains("arena") => Ok(ta_launcher_path.join("Game Files")),
        id if id.contains("route") => Ok(ta_launcher_path.join("Tribes Config")), 
        id if id.contains("stdlib") => Ok(ta_launcher_path.join("Tribes Config")),
        _ => Err("Unrecognized package type".to_string()),
    }
}


#[tauri::command]
pub async fn download_package(
    package_id: String, 
    filesize: u64, 
    handle: AppHandle
) -> Result<String, String> {
    let base_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/";
    let object_key = format!("packages/{}.zip", package_id);
    let download_url = format!("{}{}", base_url, object_key);

    let download_path = determine_download_path(&package_id)?;
    let temp_dir = tempfile::tempdir().map_err(|e| e.to_string())?;
    let temp_zip_path = temp_dir.path().join("temp_package.zip");

    let progress = download_zip_file(download_url, temp_zip_path.clone(), filesize, &handle).await?;

    // Emit final progress
    progress.emit_finished(&handle);

    extract_zip_file(temp_zip_path, download_path.clone()).map_err(|e| e.to_string())?;
    temp_dir.close().map_err(|e| e.to_string())?;

    Ok(format!("Extracted to {:?}", download_path))
}

async fn download_zip_file(
    download_url: String,
    temp_zip_path: PathBuf,
    filesize: u64,
    handle: &AppHandle,
) -> Result<Progress, String> {
    let mut progress = Progress {
        package_id: "".to_string(), // Update this as needed
        filesize,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0,
    };

    let response = reqwest::get(&download_url).await.map_err(|e| e.to_string())?;
    let mut stream = response.bytes_stream();

    let start = std::time::Instant::now();
    let mut last_update = start;

    let mut temp_zip_file = tokio::fs::File::create(&temp_zip_path).await.map_err(|e| e.to_string())?;

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        progress.transfered += chunk.len() as u64;
        temp_zip_file.write_all(&chunk).await.map_err(|e| e.to_string())?;

        progress.percentage = (progress.transfered as f64 * 100.0) / filesize as f64;
        progress.transfer_rate = (progress.transfered as f64) / (start.elapsed().as_secs_f64());

        if last_update.elapsed().as_millis() >= 50 { 
            progress.emit_progress(handle);
            last_update = std::time::Instant::now();
        }
    }

    Ok(progress)
}


fn extract_zip_file(zip_path: PathBuf, destination_path: PathBuf) -> Result<(), String> {
    let zip_file = std::fs::File::open(zip_path).map_err(|e| e.to_string())?;
    let mut zip_archive = zip::ZipArchive::new(zip_file).map_err(|e| e.to_string())?;

    for i in 0..zip_archive.len() {
        let mut file = zip_archive.by_index(i).map_err(|e| e.to_string())?;
        let file_path = file.mangled_name();
        let mut outpath = destination_path.join(&file_path);
    
        // Check if the file_path starts with "!CONFIG/" or "!TRIBESDIR/" and adjust the path
        let stripped_path = if file_path.starts_with("!CONFIG/") {
            file_path.strip_prefix("!CONFIG/").unwrap()
        } else if file_path.starts_with("!TRIBESDIR/") {
            file_path.strip_prefix("!TRIBESDIR/").unwrap()
        } else {
            &file_path
        };
    
        outpath = destination_path.join(stripped_path);

        // Create directories as needed
        if file.is_dir() {
            std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = outpath.parent() {
                if !parent.exists() {
                    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                }
            }

            // Manage permissions if file exists and is read-only
            if outpath.exists() && outpath.is_file() {
                let metadata = std::fs::metadata(&outpath).map_err(|e| e.to_string())?;
                if metadata.permissions().readonly() {
                    let mut permissions = metadata.permissions();
                    permissions.set_readonly(false);
                    std::fs::set_permissions(&outpath, permissions).map_err(|e| e.to_string())?;
                }
            }

            // Extract file
            let mut outfile = std::fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

