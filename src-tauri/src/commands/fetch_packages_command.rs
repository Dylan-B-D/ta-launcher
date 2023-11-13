// fetch_packages_command.rs
use reqwest;
use serde_json::json;
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet};

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
pub async fn fetch_dependency_tree() -> Result<String, String> {
    let yaml_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/packageconfig.yaml";
    let response = reqwest::get(yaml_url).await.map_err(|e| e.to_string())?;
    let yaml_content = response.text().await.map_err(|e| e.to_string())?;

    let packages: PackageConfig = serde_yaml::from_str(&yaml_content)
        .map_err(|e| e.to_string())?;

    // Building the dependency map
    let mut dependency_map = HashMap::new();
    let mut all_dependencies = HashSet::new();

    for package in &packages.packages {
        let dependencies = package.dependencies.clone().unwrap_or_else(Vec::new);
        for dep in &dependencies {
            all_dependencies.insert(dep.clone());
        }
        dependency_map.insert(package.id.clone(), dependencies);
    }

    // Identify root packages
    let root_packages: Vec<_> = dependency_map.keys()
        .filter(|pkg_id| !all_dependencies.contains(*pkg_id))
        .cloned()
        .collect();

    // Build trees for each root package
    let mut tree = HashMap::new();
    for root in root_packages {
        tree.insert(root.clone(), dependency_map.get(&root).unwrap().clone());
    }

    let tree_json = serde_json::to_string(&tree).map_err(|e| e.to_string())?;
    println!("Dependency Tree: {}", tree_json);

    // Return the tree as JSON string
    Ok(tree_json)
}

#[tauri::command]
pub async fn fetch_packages() -> Result<String, String> {
    let yaml_url = "https://tamods-update.s3.ap-southeast-2.amazonaws.com/packageconfig.yaml";
    let response = reqwest::get(yaml_url).await.map_err(|e| e.to_string())?;
    let yaml_content = response.text().await.map_err(|e| e.to_string())?;

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
