use std::collections::{HashMap, HashSet};
use reqwest;
use serde::{Deserialize, Serialize};

const PKG_ENDPOINT: &str = "https://client.update.tamods.org/";
const PKG_CFG_FILE: &str = "packageconfig.yaml";

#[derive(Serialize, Deserialize, Debug, Clone)]
#[allow(non_snake_case)]
struct Package {
    id: String,
    displayName: String,
    description: String,
    version: String,
    objectKey: String,
    size: Option<u64>,
    dependencies: Option<Vec<String>>,
    dependencyCount: Option<usize>,
    isTopLevelPackage: Option<bool>,
    totalSize: Option<u64>,
    lastModified: Option<String>,
    hash: Option<String>,
}

impl Default for Package {
    fn default() -> Self {
        Package {
            id: String::new(),
            displayName: String::new(),
            description: String::new(),
            version: String::new(),
            objectKey: String::new(),
            size: Some(0),
            dependencies: Some(Vec::new()),
            dependencyCount: Some(0),
            isTopLevelPackage: Some(false),
            totalSize: Some(0),
            lastModified: Some(String::new()),
            hash: Some(String::new()),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct PackageList {
    packages: Vec<Package>,
}

#[derive(Serialize, Deserialize, Debug)]
struct PackageNode {
    package: Package,
    dependencies: HashMap<String, PackageNode>,
}

#[tauri::command]
pub async fn fetch_packages() -> Result<String, String> {
    let mut package_tree = fetch_package_tree().await?;

    // Iterate through the package tree and update metadata for each package and its dependencies
    for (_package_name, package_info) in package_tree.iter_mut() {

        package_info.package.isTopLevelPackage = Some(true);

        package_info.package.dependencyCount = Some(count_dependencies(package_info));

        if let Err(e) = update_package_metadata(package_info).await {
            return Err(e);
        }

        // Calculate and set the total size for top-level packages
        let total_size = calculate_total_size(package_info);
        package_info.package.totalSize = Some(total_size);
    }

    serde_json::to_string(&package_tree).map_err(|e| e.to_string())
}

fn calculate_total_size(node: &PackageNode) -> u64 {
    let own_size = node.package.size.unwrap_or(0);
    let dependencies_size: u64 = node.dependencies
        .values()
        .map(|dep_node| calculate_total_size(dep_node))
        .sum();
    own_size + dependencies_size
}

// Function to count the dependencies recursively
fn count_dependencies(node: &PackageNode) -> usize {
    node.dependencies
        .values()
        .map(|child_node| 1 + count_dependencies(child_node)) // count this dependency plus any sub-dependencies
        .sum()
}

async fn fetch_package_tree() -> Result<HashMap<String, PackageNode>, String> {
    let yaml_url = format!("{}{}", PKG_ENDPOINT, PKG_CFG_FILE);
    let response = reqwest::get(yaml_url).await.map_err(|e| e.to_string())?;
    let yaml_content = response.text().await.map_err(|e| e.to_string())?;

    let packages: PackageList = serde_yaml::from_str(&yaml_content)
        .map_err(|e| e.to_string())?;

    let mut package_map: HashMap<String, Package> = packages.packages
        .iter()
        .map(|p| (p.id.clone(), Package::default()))
        .collect();

    for package in packages.packages {
        if let Some(default_package) = package_map.get_mut(&package.id) {
            // Merge the package from YAML with the default package
            default_package.id = package.id;
            default_package.displayName = package.displayName;
            default_package.description = package.description;
            default_package.version = package.version;
            default_package.objectKey = package.objectKey;
            default_package.size = package.size.or(default_package.size);
            default_package.dependencies = package.dependencies.or(default_package.dependencies.clone());
            default_package.dependencyCount = package.dependencyCount.or(default_package.dependencyCount);
            default_package.isTopLevelPackage = package.isTopLevelPackage.or(default_package.isTopLevelPackage);
            default_package.totalSize = package.totalSize.or(default_package.totalSize);
            default_package.lastModified = package.lastModified.or(default_package.lastModified.clone());
            default_package.hash = package.hash.or(default_package.hash.clone());
        }
    }

    let mut dependency_map = HashMap::new();
    let mut all_dependencies = HashSet::new();

    for package in package_map.values() {
        let dependencies = package.dependencies.clone().unwrap_or_else(Vec::new);
        for dep in &dependencies {
            all_dependencies.insert(dep.clone());
        }
        dependency_map.insert(package.id.clone(), dependencies);
    }

    let root_packages: Vec<_> = dependency_map.keys()
        .filter(|pkg_id| !all_dependencies.contains(*pkg_id))
        .cloned()
        .collect();

    let mut tree = HashMap::new();
    for root in root_packages {
        tree.insert(root.clone(), build_package_node(&root, &package_map, &dependency_map));
    }

    Ok(tree)
}
fn build_package_node(
    package_id: &str,
    package_map: &HashMap<String, Package>,
    dependency_map: &HashMap<String, Vec<String>>
) -> PackageNode {
    let package = package_map.get(package_id).unwrap().clone();
    let mut dependencies = HashMap::new();

    if let Some(deps) = dependency_map.get(package_id) {
        for dep in deps {
            // Only include the package information for dependencies, not their nested dependencies
            if let Some(dep_package) = package_map.get(dep) {
                dependencies.insert(dep.clone(), PackageNode {
                    package: dep_package.clone(),
                    dependencies: HashMap::new(),
                });
            }
        }
    }

    PackageNode {
        package,
        dependencies,
    }
}

async fn update_package_metadata(package_node: &mut PackageNode) -> Result<(), String> {
    // Update metadata for the current package
    let updated_package = fetch_package_metadata(package_node.package.clone()).await?;
    package_node.package = updated_package;

    // Recursively update metadata for each dependency
    for (_dep_name, dep_node) in package_node.dependencies.iter_mut() {
        // Wrap the recursive call in Box::pin
        let future = Box::pin(update_package_metadata(dep_node));
        future.await?;
    }

    Ok(())
}

async fn fetch_package_metadata(mut package: Package) -> Result<Package, String> {
    let url = format!("{}{}", PKG_ENDPOINT, package.objectKey);
    let client = reqwest::Client::new();
    let response = client.head(url).send().await.map_err(|e| e.to_string())?;

    package.size = Some(response.headers().get(reqwest::header::CONTENT_LENGTH)
            .and_then(|ct| ct.to_str().ok())
            .and_then(|ct_str| ct_str.parse::<u64>().ok())
            .unwrap_or(0));

    package.lastModified = response.headers().get(reqwest::header::LAST_MODIFIED)
        .and_then(|lm| lm.to_str().ok())
        .map(String::from)
        .or(Some("unknown".to_string()));

        package.hash = response.headers().get(reqwest::header::ETAG)
        .and_then(|e| e.to_str().ok())
        .map(|s| s.trim_matches('"').to_string())
        .or(Some("unknown".to_string()));

    Ok(package)
}