use std::fs::File;
use std::io::{self, Read, BufReader};
use serde::Serialize;
use directories::UserDirs;
use byteorder::{LittleEndian, ReadBytesExt};
use std::convert::TryInto;

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
        let time = f32::from_le_bytes(pos_buf[0..4].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);
        let loc = (
            -f32::from_le_bytes(pos_buf[4..8].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?),
            f32::from_le_bytes(pos_buf[8..12].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?),
            f32::from_le_bytes(pos_buf[12..16].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?),
        );
        let vel = (
            f32::from_le_bytes(pos_buf[16..20].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?),
            f32::from_le_bytes(pos_buf[20..24].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?),
            f32::from_le_bytes(pos_buf[24..28].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?),
        );
        let pitch = i32::from_le_bytes(pos_buf[28..32].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);
        let yaw = i32::from_le_bytes(pos_buf[32..36].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);
        let phys = i32::from_le_bytes(pos_buf[36..40].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);

        let skiing = pos_buf[40] != 0;
        let jetting = pos_buf[41] != 0;
        let health = pos_buf[42];
        let energy = f32::from_le_bytes(pos_buf[43..47].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);
        let eta = i32::from_le_bytes(pos_buf[48..52].try_into().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);

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
    let user_dirs = UserDirs::new().ok_or("Unable to find user directories")?;
    let documents_path = user_dirs.document_dir().ok_or("Unable to find documents directory")?;
    let routes_path = documents_path.join("My Games/Tribes Ascend/TribesGame/config/routes");
    let file_path = routes_path.join(file);

    // Check if the file exists
    if !file_path.exists() {
        return Err("File does not exist".into());
    }

    // Convert the Path to a string and handle potential error
    let file_path_str = file_path.to_str().ok_or("Failed to convert path to string")?;

    // Call decode_route_file and convert any io::Error into a String
    decode_route_file(file_path_str).map_err(|e| e.to_string())
}
