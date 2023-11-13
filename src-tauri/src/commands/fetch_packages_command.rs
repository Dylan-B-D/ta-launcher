// fetch_packages_command.rs
use reqwest;
use serde_json::json;
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
pub async fn fetch_packages() -> Result<String, String> {
    let yaml_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/packageconfig.yaml";
    let response = reqwest::get(yaml_url).await.map_err(|e| e.to_string())?;
    let yaml_content = response.text().await.map_err(|e| e.to_string())?;

    println!("YAML Content: \n{}", yaml_content);

    let packages: PackageConfig = serde_yaml::from_str(&yaml_content)
        .map_err(|e| e.to_string())?;

    serde_json::to_string(&packages)
        .map_err(|e| e.to_string())
}

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
