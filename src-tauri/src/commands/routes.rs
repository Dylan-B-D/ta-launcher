use super::data::CONFIG_DIR;
use serde::Serialize;
use std::convert::TryInto;
use std::env;
use std::fs::{self, File};
use std::io::{self, BufReader, Read};
use std::path::Path;
use std::process::Command;
use tauri::command;

#[derive(Debug, serde::Serialize)]
pub struct Route {
    game_mode: String,
    map: String,
    side: String,
    class: String,
    username: String,
    route_name: String,
    time: String,
    file_name: String,
}

#[command]
pub fn get_route_files() -> Result<Vec<Route>, String> {
    let routes_path = &CONFIG_DIR.join("routes");

    if !routes_path.exists() {
        return Err("Routes directory does not exist".into());
    }

    match fs::read_dir(routes_path) {
        Ok(entries) => {
            let routes = entries
                .filter_map(|entry| {
                    let entry = entry.ok()?;
                    let path = entry.path();
                    if path.is_file() && path.extension()? == "route" {
                        let file_name = path.file_name()?.to_str()?;
                        parse_route_format(file_name)
                    } else {
                        None
                    }
                })
                .collect();
            Ok(routes)
        }
        Err(_) => Err("Failed to read routes directory".into()),
    }
}

// This would have been a lot simpler if I hadn't forgotten brackets on my websites re-encoder for route descriptions.
fn parse_route_format(file_name: &str) -> Option<Route> {
    // Splitting the filename at the first '-' to extract the game mode
    let (game_mode, rest) = file_name.split_once('-')?;

    // Further splitting the string to extract map, side, class, and the remaining part
    let parts: Vec<&str> = rest.splitn(4, '_').collect();
    if parts.len() < 4 {
        return None;
    }

    let map = parts[0];
    let side = parts[1];
    let class = parts[2];
    let mut username = parts[3];

    // Check if the username contains '.route', indicating no brackets in the file name
    let mut route_name = "";
    let mut time = "";
    if username.contains(".route") {
        // Split the remaining part at the first '_' after the username
        if let Some((usr, remaining)) = username.split_once('_') {
            username = usr;
            // Extract route name and time from the remaining part
            if let Some((route, time_with_ext)) = remaining.rsplit_once('_') {
                route_name = route;
                time = time_with_ext.trim_end_matches(".route");
            }
        }
    } else {
        // Route name and time are enclosed in brackets
        if let Some((usr, route_name_with_brackets)) = parts[3].split_once("_(") {
            username = usr;
            let (route, time_with_ext) = route_name_with_brackets
                .rsplit_once(")_")
                .unwrap_or((route_name_with_brackets, ""));
            route_name = route;
            time = time_with_ext.trim_end_matches(".route");
        }
    }

    Some(Route {
        game_mode: game_mode.to_string(),
        map: map.to_string(),
        side: side.to_string(),
        class: class.to_string(),
        username: username.to_string(),
        route_name: route_name.to_string(),
        time: time.to_string(),
        file_name: file_name.to_string(),
    })
}

#[command]
pub fn delete_route_file(file: String) -> Result<(), String> {
    let routes_path = &CONFIG_DIR.join("routes");

    let file_path = routes_path.join(file);

    // Check if the file exists
    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    // Attempt to delete the file
    match fs::remove_file(file_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete file: {}", e)),
    }
}

#[derive(Debug, Serialize)]
pub struct Position {
    time: f32,
    loc: (f32, f32, f32),
    vel: (f32, f32, f32),
    pitch: i32,
    yaw: i32,
    phys: i32,
    skiing: bool,
    jetting: bool,
    health: u8,
    energy: f32,
    eta: i32,
}

#[derive(Debug, Serialize)]
pub struct RouteData {
    route_file_version: f32,
    map_name: String,
    class_abbr: String,
    player_name: String,
    description: String,
    team_num: u8,
    class_id: i32,
    class_health: u32,
    flag_grab_time: f32,
    route_length: u32,
    positions: Vec<Position>,
}

fn decode_route_file(filename: &str) -> io::Result<RouteData> {
    let mut file = BufReader::new(File::open(filename)?);

    // Read the file version
    let mut buf = [0u8; 4];
    file.read_exact(&mut buf)?;
    let route_file_version = f32::from_le_bytes(buf);

    // Read strings
    let map_name = read_cstring(&mut file)?;
    let class_abbr = read_cstring(&mut file)?;
    let player_name = read_cstring(&mut file)?;
    let description = read_cstring(&mut file)?;

    // Read metadata
    let mut buf = [0u8; 1];
    file.read_exact(&mut buf)?;
    let team_num = buf[0];

    let mut buf = [0u8; 4];
    file.read_exact(&mut buf)?;
    let class_id = i32::from_le_bytes(buf);

    file.read_exact(&mut buf)?;
    let class_health = u32::from_le_bytes(buf);

    file.read_exact(&mut buf)?;
    let flag_grab_time = f32::from_le_bytes(buf);

    file.read_exact(&mut buf)?;
    let route_length = u32::from_le_bytes(buf);

    // Decode positions
    let mut positions = Vec::new();
    loop {
        let mut pos_buf = vec![0u8; 52];
        if file.read_exact(&mut pos_buf).is_err() {
            break; // Break if less than 52 bytes are available
        }

        // Unpack position
        let time = f32::from_le_bytes(
            pos_buf[0..4]
                .try_into()
                .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
        );
        let loc = (
            -f32::from_le_bytes(
                pos_buf[4..8]
                    .try_into()
                    .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
            ),
            f32::from_le_bytes(
                pos_buf[8..12]
                    .try_into()
                    .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
            ),
            f32::from_le_bytes(
                pos_buf[12..16]
                    .try_into()
                    .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
            ),
        );
        let vel = (
            f32::from_le_bytes(
                pos_buf[16..20]
                    .try_into()
                    .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
            ),
            f32::from_le_bytes(
                pos_buf[20..24]
                    .try_into()
                    .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
            ),
            f32::from_le_bytes(
                pos_buf[24..28]
                    .try_into()
                    .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
            ),
        );
        let pitch = i32::from_le_bytes(
            pos_buf[28..32]
                .try_into()
                .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
        );
        let yaw = i32::from_le_bytes(
            pos_buf[32..36]
                .try_into()
                .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
        );
        let phys = i32::from_le_bytes(
            pos_buf[36..40]
                .try_into()
                .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
        );

        let skiing = pos_buf[40] != 0;
        let jetting = pos_buf[41] != 0;
        let health = pos_buf[42];
        let energy = f32::from_le_bytes(
            pos_buf[43..47]
                .try_into()
                .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
        );
        let eta = i32::from_le_bytes(
            pos_buf[48..52]
                .try_into()
                .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?,
        );

        let position = Position {
            time,
            loc,
            vel,
            pitch,
            yaw,
            phys,
            skiing,
            jetting,
            health,
            energy,
            eta,
        };

        positions.push(position);
    }

    Ok(RouteData {
        route_file_version,
        map_name,
        class_abbr,
        player_name,
        description,
        team_num,
        class_id,
        class_health,
        flag_grab_time,
        route_length,
        positions,
    })
}

fn read_cstring(file: &mut BufReader<File>) -> io::Result<String> {
    let mut string = Vec::new();
    loop {
        let mut buf = [0u8; 1];
        file.read_exact(&mut buf)?;
        if buf[0] == 0 || buf[0] == b' ' {
            break;
        }
        string.push(buf[0]);
    }
    Ok(String::from_utf8_lossy(&string).to_string())
}

#[tauri::command]
pub fn decode_route(file: String) -> Result<RouteData, String> {
    let routes_path = &CONFIG_DIR.join("routes");
    let file_path = routes_path.join(file);

    // Check if the file exists
    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    // Convert the Path to a string and handle potential error
    let file_path_str = file_path
        .to_str()
        .ok_or("Failed to convert path to string")?;

    // Call decode_route_file and convert any io::Error into a String
    decode_route_file(file_path_str).map_err(|e| e.to_string())
}

#[command]
pub fn python_route_decoder(file: String, axis: Option<String>) -> Result<String, String> {
    println!("Python route decoder");

    // Check if Python is installed
    let python_check = Command::new("python").arg("--version").output();

    if python_check.is_err() {
        return Err("Python is not installed on this system".to_string());
    }

    // Default to "xy" if axis is not provided
    let axis = axis.unwrap_or_else(|| "xy".to_string());
    // Get the project root directory
    let project_root = Path::new(env!("CARGO_MANIFEST_DIR"));

    // Construct the path to the Python script
    let script_path = project_root.join("scripts\\route_decoder_script.py");

    println!("{}", script_path.display());

    // Canonicalize the script path to ensure consistent path separators
    let script_path =
        fs::canonicalize(script_path).map_err(|e| format!("Failed to find script: {}", e))?;

    // Construct the file path
    let routes_path = &CONFIG_DIR.join("routes");
    let file_path = routes_path.join(&file);

    // Check if the file exists
    if !file_path.exists() {
        return Err(format!("File {} does not exist", file));
    }

    let dir_path = file_path.parent().ok_or("Failed to get directory path")?;
    let file_name = file_path
        .file_name()
        .ok_or("Failed to get file name")?
        .to_str()
        .ok_or("Failed to convert file name to string")?;

    // Execute the Python script with directory path, file name, and axis as arguments
    let output = Command::new("python")
        .arg(
            script_path
                .to_str()
                .ok_or("Failed to convert script path to string")?,
        )
        .arg(
            dir_path
                .to_str()
                .ok_or("Failed to convert directory path to string")?,
        )
        .arg(file_name)
        .arg(&axis)
        .output()
        .map_err(|e| e.to_string())?;

    // Check execution status
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

// Check if Python is installed
#[command]
pub fn check_python_installed() -> Result<bool, String> {
    // First, try to check if Python is in the system PATH
    if let Ok(path) = env::var("PATH") {
        for path in env::split_paths(&path) {
            let python_path = path.join("python");
            if python_path.exists() || python_path.with_extension("exe").exists() {
                return Ok(true);
            }
        }
    }

    // If not found in PATH, try to run Python with CREATE_NO_WINDOW flag (Windows-specific)
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        match Command::new("python")
            .arg("--version")
            .creation_flags(CREATE_NO_WINDOW)
            .output()
        {
            Ok(output) => return Ok(output.status.success()),
            Err(_) => {}
        }
    }

    // If all else fails, assume Python is not installed
    Ok(false)
}
