use tauri::command;
use directories::UserDirs;
use std::fs;

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
    let user_dirs = UserDirs::new().ok_or("Unable to find user directories")?;
    let documents_path = user_dirs.document_dir().ok_or("Unable to find documents directory")?;
    let routes_path = documents_path.join("My Games/Tribes Ascend/TribesGame/config/routes");

    if !routes_path.exists() {
        return Err("Routes directory does not exist".into());
    }

    match fs::read_dir(routes_path) {
        Ok(entries) => {
            let routes = entries.filter_map(|entry| {
                let entry = entry.ok()?;
                let path = entry.path();
                if path.is_file() && path.extension()? == "route" {
                    let file_name = path.file_name()?.to_str()?;
                    parse_route_format(file_name)
                } else {
                    None
                }
            }).collect();
            Ok(routes)
        },
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
            let (route, time_with_ext) = route_name_with_brackets.rsplit_once(")_").unwrap_or((route_name_with_brackets, ""));
            route_name = route;
            time = time_with_ext.trim_end_matches(".route");
        }
    }

    // Printing for validation
    println!("Parsed route: Game Mode: {}, Map: {}, Side: {}, Class: {}, Username: {}, Route Name: {}, Time: {}", 
        game_mode, map, side, class, username, route_name, time);

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
