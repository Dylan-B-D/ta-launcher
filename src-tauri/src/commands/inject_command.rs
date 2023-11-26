use dll_syringe::process::OwnedProcess;
use dll_syringe::Syringe;

/// Injects a dll into a process
/// # Arguments
/// * `process` - The name of the process to inject into
/// * `dll_path` - The path to the dll to inject
#[tauri::command]
pub fn inject(process: &str, dll_path: &str) -> Result<(), String> {

    // Find the process that the user wants to inject into
    let target_process = OwnedProcess::find_first_by_name(&process)
        .ok_or_else(|| format!("Process '{}' not found", process))?;

    // Creates Syringe instance with the target process
    let instance = Syringe::for_process(target_process);

    // Injects the dll into the process
    instance.inject(dll_path)
        .map_err(|e| format!("Failed to inject DLL: {}", e))?;

    // // Create a log folder
    // std::fs::create_dir_all("sola").map_err(|e| format!("Failed to create log folder: {}", e))?;
    // let mut file = File::create(format!(
    //     "sola\\log-{}.txt",
    //     chrono::Local::now().format("%Y-%m-%d %H-%M-%S")
    // ))
    // .map_err(|e| format!("Failed to create log file: {}", e))?;

    // // Write the header to the file
    // file.write_all(format!("Process: {}\r", process).as_bytes())
    //     .map_err(|e| format!("Failed to write to log file: {}", e))?;
    // file.write_all(format!("DLL: {}\r", dll_path).as_bytes())
    //     .map_err(|e| format!("Failed to write to log file: {}", e))?;
    // file.write_all(format!("Result: {}\r", format!("{:?}", result)).as_bytes())
    //     .map_err(|e| format!("Failed to write to log file: {}", e))?;

    Ok(())
}
