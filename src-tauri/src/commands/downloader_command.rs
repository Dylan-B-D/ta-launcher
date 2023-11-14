// downloader_command.rs

use std::path::PathBuf;
use tauri::api::path::download_dir;
use std::env;

#[tauri::command]
pub async fn download_package(package_id: String) -> Result<String, String> {
    let base_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/";
    
    // Check if the package_id contains 'dll'
    let object_key = if package_id.contains("dll") {
        format!("packages/{}.zip", package_id)
    } else {
        return Err("Package not recognized".to_string());
    };

    let download_url = format!("{}{}", base_url, object_key);
    println!("Download url: {}", download_url);

    let download_url = format!("{}{}", base_url, object_key);
    println!("Download url: {}", download_url);

    // Determine the download path
    let download_path = if object_key.contains("dll") {
        let username = env::var("USERNAME").unwrap_or_else(|_| "default".into());
        let tribes_path = PathBuf::from(format!(r"C:\Users\{}\Documents\My Games\Tribes Ascend\TribesGame\TALauncher", username));
        if !tribes_path.exists() {
            tokio::fs::create_dir_all(&tribes_path).await.map_err(|e| e.to_string())?;
        }
        tribes_path
    } else {
        if cfg!(target_os = "windows") {
            PathBuf::from(env::var("USERPROFILE").unwrap_or_else(|_| "C:\\".into()))
                .join("Downloads")
        } else {
            download_dir().unwrap_or_else(|| PathBuf::from("downloads"))
        }
    };

    // Append each part of the object_key to the file_path
    let file_path = download_path.join(object_key.split('/').last().unwrap());

    println!("File Path: {:?}", file_path);

    // Perform the download
    let response = reqwest::get(&download_url).await.map_err(|e| e.to_string())?;
    let content = response.bytes().await.map_err(|e| e.to_string())?;

    // Create a temporary path for the zip file
    let temp_dir = tempfile::tempdir().map_err(|e| e.to_string())?;
    let temp_zip_path = temp_dir.path().join("temp_package.zip");

    // Write the content to the temporary zip file
    tokio::fs::write(&temp_zip_path, &content).await.map_err(|e| e.to_string())?;

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

