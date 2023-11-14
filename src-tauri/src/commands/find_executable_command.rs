use std::path::Path;
use std::time::{Duration, Instant};
use walkdir::{WalkDir, DirEntry};
use tauri::{command, Window};
use std::env;


#[command]
pub async fn find_executable(window: Window) -> Option<String> {
    let start = Instant::now();
    let timeout = Duration::from_secs(10);
    let target_file = "TribesAscend.exe";
    let excluded_directories = vec!["$Recycle.Bin", "Windows", "Program Files", "Program Files (x86)", "AppData", "ProgramData", "Python", "anaconda3", "UDK"];

    let common_paths = vec![
        "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tribes\\Binaries\\Win32",
        "C:\\Program Files\\Steam\\steamapps\\common\\Tribes\\Binaries\\Win32",
        // Add other common paths here
    ];

    // Check common paths first
    for path in common_paths {
        if let Some(found_path) = search_directory(path, target_file, start, timeout) {
            return Some(found_path);
        }
    }

    // Construct specific user directories
    if let Some(home_dir) = env::var("USERPROFILE").ok() {
        let specific_paths = vec![
            format!(r"{}\Documents\My Games", home_dir),
            format!(r"{}\Desktop", home_dir),
        ];

        // Check specific user directories
        for path in specific_paths {
            if let Some(found_path) = search_directory(&path, target_file, start, timeout) {
                return Some(found_path);
            }
        }
    }

   // Get the list of available drives
   let available_drives = get_available_drives();

    // Search other drives for both Steam and non-Steam Tribes directories
    for drive in available_drives {
        let steam_path = format!(r"{}\Steam\steamapps\common\Tribes\Binaries\Win32", drive);
        let non_steam_path = format!(r"{}\Tribes\Binaries\Win32", drive);

        // Check the Steam path
        if let Some(found_path) = search_directory(&steam_path, target_file, start, timeout) {
            return Some(found_path);
        }

        // Check the non-Steam path
        if let Some(found_path) = search_directory(&non_steam_path, target_file, start, timeout) {
            return Some(found_path);
        }
    }


    // Extensive search
    for (index, entry) in WalkDir::new("C:\\")
    .into_iter()
    .filter_entry(|e| !should_skip_directory(e, &excluded_directories)) // Filter out excluded directories
    .filter_map(|e| e.ok())
    .enumerate() 
                {
        if start.elapsed() > timeout {
            break;
        }
        if should_skip_directory(&entry, &excluded_directories) {
            continue;
        }
        if index % 100 == 0 { // Emit progress update for every 100 iterations
            window.emit("search_progress", format!("{} files checked", index)).unwrap();
        }
        if entry.file_name().to_string_lossy() == target_file {
            return Some(entry.path().to_string_lossy().to_string());
        }
    }

    None
}

fn search_directory(base_path: &str, file_name: &str, start: Instant, timeout: Duration) -> Option<String> {
    for entry in WalkDir::new(base_path).max_depth(3).into_iter().filter_map(|e| e.ok()) {
        if start.elapsed() > timeout {
            break;
        }
        if entry.file_name().to_string_lossy() == file_name {
            return Some(entry.path().to_string_lossy().to_string());
        }
    }
    None
}

fn should_skip_directory(entry: &DirEntry, excluded_directories: &[&str]) -> bool {
    // Check for hidden directories or those starting with a dot
    if entry.file_name().to_str().map_or(false, |name| name.starts_with('.')) {
        return true;
    }
   

    // Existing checks for excluded directories
    excluded_directories.iter().any(|&dir| {
        entry.path().to_str().map_or(false, |path| path.contains(dir))
    })
}



fn get_available_drives() -> Vec<String> {
    let mut drives = Vec::new();
    for drive_letter in 'A'..='Z' {
        let drive = format!("{}:\\", drive_letter);
        if Path::new(&drive).exists() {
            drives.push(drive);
        }
    }
    drives
}