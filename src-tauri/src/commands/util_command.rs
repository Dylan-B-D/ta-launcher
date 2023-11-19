// util_commands.rs;
use sysinfo::{System, SystemExt, ProcessExt, Pid, PidExt};


#[tauri::command]
pub fn is_process_running(process_name: &str) -> bool {
    let s = System::new_all();
    // Loop though all process names to check if it's running (inneficient, due to large process lists)
    for (_pid, process) in s.processes() {
        if process.name() == process_name {
            return true;
        }
    }
    false
}

// Only check a specific Process ID if it's running
#[tauri::command]
pub fn is_pid_running(pid: u32) -> bool {
    let s = System::new_all();
    let pid = Pid::from(pid as usize);  // Convert u32 to usize, then to Pid
    s.process(pid).is_some()
}

#[tauri::command]
pub fn get_process_pid(process_name: &str) -> Option<u32> {
    let s = System::new_all();
    for (pid, process) in s.processes() {
        if process.name() == process_name {
            return Some(pid.as_u32()); // Convert Pid to u32
        }
    }
    None
}