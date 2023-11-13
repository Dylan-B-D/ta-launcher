// fetch_package_metadata_command.rs
use reqwest;
use serde_json::json;

#[tauri::command]
pub async fn fetch_package_metadata(url: &str) -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client.head(url).send().await.map_err(|e| e.to_string())?;

    let size = response.headers().get(reqwest::header::CONTENT_LENGTH)
        .and_then(|ct| ct.to_str().ok())
        .unwrap_or("unknown");

    let last_modified = response.headers().get(reqwest::header::LAST_MODIFIED)
        .and_then(|lm| lm.to_str().ok())
        .unwrap_or("unknown");

    let etag = response.headers().get(reqwest::header::ETAG)
        .and_then(|e| e.to_str().ok())
        .unwrap_or("unknown");


    Ok(json!({
        "size": size,
        "lastModified": last_modified,
        "hash": etag
    }).to_string())
}
