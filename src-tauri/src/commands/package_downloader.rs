use std::time::Duration;

use tauri::Emitter;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use dirs::document_dir;
use futures::stream::StreamExt;
use reqwest::Client;
use tokio::time::sleep;

#[tauri::command]
pub async fn download_package(app: tauri::AppHandle, package_id: String, object_key: String, package_hash: String) -> Result<(), String> {
    let base_url = "https://client.update.tamods.org/";
    let download_url = format!("{}{}", base_url, object_key);
    
    let client = Client::new();
    let res = client.get(&download_url).send().await.map_err(|e| e.to_string())?;

    let docs_dir = document_dir().ok_or("Failed to get documents directory")?;
    let target_dir = docs_dir.join("My Games").join("Tribes Ascend").join("TribesGame");
    std::fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

    let file_path = target_dir.join(format!("{}.zip", package_id));
    let mut file = File::create(file_path).await.map_err(|e| e.to_string())?;

    let mut downloaded = 0;
    let mut stream = res.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;

        // Emit progress event
        app.emit("download-progress", (package_id.clone(), downloaded))
            .map_err(|e| e.to_string())?;

        // Add a delay to simulate rate limiting for debugging progress bar
        sleep(Duration::from_millis(100)).await; // !TODO: Remove this line
    }

    // Emit completion event
    app.emit("download-completed", (package_id.clone(), package_hash))
        .map_err(|e| e.to_string())?;

    Ok(())
}