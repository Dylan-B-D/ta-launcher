use tauri::command;
use std::process::Command;
use directories::UserDirs;
use std::path::Path;
use std::fs;
use std::env;

#[command]
pub fn python_route_decoder(file: String) -> Result<String, String> {
    // Get the project root directory
    let project_root = Path::new(env!("CARGO_MANIFEST_DIR"));

    // Construct the path to the Python script
    let script_path = project_root.join("scripts\\route_decoder_script.py");

    println!("{}", script_path.display());

    // Canonicalize the script path to ensure consistent path separators
    let script_path = fs::canonicalize(script_path)
        .map_err(|e| format!("Failed to find script: {}", e))?;

    // Construct the file path as before
    let user_dirs = UserDirs::new().ok_or("Unable to find user directories")?;
    let documents_path = user_dirs.document_dir().ok_or("Unable to find documents directory")?;
    let routes_path = documents_path.join("My Games/Tribes Ascend/TribesGame/config/routes");
    let file_path = routes_path.join(&file);

    // Check if the file exists
    if !file_path.exists() {
        return Err(format!("File {} does not exist", file));
    }

    let dir_path = file_path.parent().ok_or("Failed to get directory path")?;
    let file_name = file_path.file_name().ok_or("Failed to get file name")?
        .to_str().ok_or("Failed to convert file name to string")?;

    // Execute the Python script with directory path and file name as separate arguments
    let output = Command::new("python")
    .arg(script_path.to_str().ok_or("Failed to convert script path to string")?)
    .arg(dir_path.to_str().ok_or("Failed to convert directory path to string")?)
    .arg(file_name)
    .output()
    .map_err(|e| e.to_string())?;

    // Check execution status
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}