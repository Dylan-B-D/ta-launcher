// util_commands.rs
use tauri::Result;
use sysinfo::{System, SystemExt, ProcessExt};


#[tauri::command]
pub fn is_process_running(process_name: &str) -> bool {
    print!("{}", "is_process_running");
    let s = System::new_all();
    // We use the process name to check if it's running
    for (pid, process) in s.processes() {
        if process.name() == process_name {
            return true;
        }
    }
    false
}