use tauri::command;
use std::process::Command;
use directories::UserDirs;
use std::path::Path;
use std::env;

#[tauri::command]
pub fn python_route_decoder(file: String) -> Result<String, String> {
    // Get the project root directory
    let project_root = Path::new(env!("CARGO_MANIFEST_DIR"));

    // Construct the path to the Python script
    let script_path = project_root.join("src-tauri/scripts/your_python_script.py");

    // Ensure the script exists
    if !script_path.exists() {
        return Err("Python script not found".into());
    }

    // Construct the file path as before
    let user_dirs = UserDirs::new().ok_or("Unable to find user directories")?;
    let documents_path = user_dirs.document_dir().ok_or("Unable to find documents directory")?;
    let routes_path = documents_path.join("My Games/Tribes Ascend/TribesGame/config/routes");
    let file_path = routes_path.join(&file);

    // Check if the file exists
    if !file_path.exists() {
        return Err(format!("File {} does not exist", file));
    }

    // Execute the Python script
    let output = Command::new("python")
        .arg(script_path)
        .arg(file_path)
        .output()
        .map_err(|e| e.to_string())?;

    // Check execution status
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
