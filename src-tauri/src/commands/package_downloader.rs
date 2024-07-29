use tauri::Emitter;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use dirs::document_dir;
use futures::stream::StreamExt;
use reqwest::Client;
use zip::ZipArchive;
use std::io::Write;
use std::path::Path;
use std::fs::File as StdFile;
use tempfile::TempDir;

#[tauri::command]
pub async fn download_package(
    app: tauri::AppHandle,
    package_id: String,
    object_key: String,
    package_hash: String,
    tribes_dir: String,
    app_data_dir: String
) -> Result<(), String> {
    let base_url = "https://client.update.tamods.org/";
    let download_url = format!("{}{}", base_url, object_key);
    
    let client = Client::new();
    let res = client.get(&download_url).send().await.map_err(|e| e.to_string())?;

    let temp_dir = TempDir::new().map_err(|e| e.to_string())?;
    let file_path = temp_dir.path().join(format!("{}.zip", package_id));
    let mut file = File::create(&file_path).await.map_err(|e| e.to_string())?;

    let mut downloaded = 0;
    let mut stream = res.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;

        app.emit("download-progress", (package_id.clone(), downloaded))
            .map_err(|e| e.to_string())?;
    }

    // Ensure the file is fully written before we try to extract it
    file.flush().await.map_err(|e| e.to_string())?;

    // Clone package_id for use in the closure
    let package_id_clone = package_id.clone();

    // Extract the zip file
    let extraction_result = tokio::task::spawn_blocking(move || {
        extract_package(file_path, tribes_dir, app_data_dir, package_id_clone)
    }).await.map_err(|e| e.to_string())?;

    // Check the result of the extraction
    extraction_result?;

    app.emit("download-completed", (package_id.clone(), package_hash))
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn extract_package(zip_path: std::path::PathBuf, tribes_dir: String, app_data_dir: String, package_id: String) -> Result<(), String> {
    let file = StdFile::open(zip_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

    let docs_dir = document_dir().ok_or("Failed to get documents directory")?;
    let config_dir = docs_dir.join("My Games").join("Tribes Ascend").join("TribesGame").join("config");
    std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        let outpath = if outpath.starts_with("!CONFIG") {
            config_dir.join(outpath.strip_prefix("!CONFIG").unwrap())
        } else if outpath.starts_with("!TRIBESDIR") {
            Path::new(&tribes_dir).join(outpath.strip_prefix("!TRIBESDIR").unwrap())
        } else {
            let base_path = Path::new(&app_data_dir);
            if outpath.extension().map_or(false, |ext| ext == "dll") {
                base_path.join("dlls").join(outpath)
            } else {
                base_path.join(outpath)
            }
        };

        if file.name().ends_with('/') {
            std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(&p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = StdFile::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    // Initialize ubermenu if package is tamods-stdlib
    if package_id == "tamods-stdlib" {
        let init_ubermenu = config_dir.join("config.lua");
        let mut config_file = StdFile::create(init_ubermenu).map_err(|e| e.to_string())?;
        config_file.write_all(b"require(\"presets/ubermenu/preset\")\n").map_err(|e| e.to_string())?;
    }

    Ok(())
}
