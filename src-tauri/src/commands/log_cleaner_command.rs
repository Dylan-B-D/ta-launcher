use std::fs;
use std::path::{Path, PathBuf};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use std::env;

#[derive(Serialize, Deserialize)]
pub struct DirectoryStats {
    exists: bool,
    total_size: String,
    item_count: usize,
    oldest_file_date: Option<String>,
}

#[tauri::command]
pub fn check_directory_stats() -> Result<DirectoryStats, String> {
    // Determine the log file path using a generalized approach
    let username = env::var("USERNAME").unwrap_or_else(|_| "default".into());
    let log_file_path = format!(r"C:\Users\{}\Documents\My Games\Tribes Ascend\TribesGame\Logs", username);

    let path = Path::new(&log_file_path);
    let mut total_size: u64 = 0;
    let mut stats = DirectoryStats {
        exists: path.exists() && path.is_dir(),
        total_size: "0 bytes".to_string(),
        item_count: 0,
        oldest_file_date: None,
    };

    if stats.exists {
        for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let metadata = entry.metadata().map_err(|e| e.to_string())?;

            total_size += metadata.len(); // Update the total size
            stats.item_count += 1;
            if let Ok(modified) = metadata.modified() {
                let datetime: DateTime<Utc> = modified.into();
                let formatted_date = datetime.to_rfc3339();

                if stats.oldest_file_date.is_none() || &formatted_date < stats.oldest_file_date.as_ref().unwrap() {
                    stats.oldest_file_date = Some(formatted_date);
                }
            }

        }
    }

    stats.total_size = format_size(total_size);
    Ok(stats)
}


fn format_size(bytes: u64) -> String {
    const KIB: u64 = 1024;
    const MIB: u64 = KIB * 1024;
    const GIB: u64 = MIB * 1024;

    if bytes < KIB {
        format!("{} bytes", bytes)
    } else if bytes < MIB {
        format!("{:.2} KB", bytes as f64 / KIB as f64)
    } else if bytes < GIB {
        format!("{:.2} MB", bytes as f64 / MIB as f64)
    } else {
        format!("{:.2} GB", bytes as f64 / GIB as f64)
    }
}
