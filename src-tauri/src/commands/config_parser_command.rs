use ini::Ini;
use directories::UserDirs;
use std::path::PathBuf;

fn get_ini_file_path(filename: &str) -> Result<PathBuf, String> {
    let user_dirs = UserDirs::new().ok_or("Unable to find user directories")?;
    let documents_dir = user_dirs.document_dir().ok_or("Unable to find documents directory")?;
    Ok(documents_dir.join("My Games/Tribes Ascend/TribesGame/config").join(filename))
}

fn filter_ini_entries(ini: &Ini, filters: &[(String, String)]) -> Vec<(String, String)> {
    filters.iter().filter_map(|(section, key)| {
        ini.section(Some(section.clone())).and_then(|s| {
            s.get(key).map(|value| {
                let composite_key = format!("{}:{}", section, key); // Include the section in the key
                (composite_key, value.to_owned())
            })
        })
    }).collect()
}

#[tauri::command]
pub fn parse_tribes_ini() -> Result<Vec<(String, String)>, String> {
    let path = get_ini_file_path("tribes.ini").map_err(|e| e.to_string())?;
    let conf = Ini::load_from_file(path).map_err(|e| e.to_string())?;
    let filters = vec![
        ("SystemSettings".to_string(), "DynamicLights".to_string()),
        ("TribesGame.TrGameEngine".to_string(), "bForceStaticTerrain".to_string()),
        ("SystemSettings".to_string(), "DepthOfField".to_string()),
        ("Engine.Engine".to_string(), "bForceStaticTerrain".to_string()),
        ("TribesGame.TrGameEngine".to_string(), "MaxSmoothedFrameRate".to_string()),
    ];
    Ok(filter_ini_entries(&conf, &filters))
}

#[tauri::command]
pub fn parse_tribes_input_ini() -> Result<Vec<(String, String)>, String> {
    let path = get_ini_file_path("TribesInput.ini").map_err(|e| e.to_string())?;
    let conf = Ini::load_from_file(path).map_err(|e| e.to_string())?;
    let filters = vec![
        ("Engine.PlayerInput".to_string(), "MouseSensitivity".to_string()),
        ("Engine.PlayerInput".to_string(), "FOVSetting".to_string()),
    ];
    Ok(filter_ini_entries(&conf, &filters))
}