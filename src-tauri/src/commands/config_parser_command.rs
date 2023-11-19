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
        ("Engine.PlayerInput".to_string(), "bEnableMouseSmoothing".to_string()),
    ];
    Ok(filter_ini_entries(&conf, &filters))
}

#[tauri::command]
pub fn update_ini_file(updated_values: Vec<(String, String)>) -> Result<(), String> {
    let tribes_ini_path = get_ini_file_path("tribes.ini").map_err(|e| e.to_string())?;
    let tribes_input_ini_path = get_ini_file_path("TribesInput.ini").map_err(|e| e.to_string())?;
    
    let mut tribes_ini_conf = Ini::load_from_file(&tribes_ini_path).map_err(|e| e.to_string())?;
    let mut tribes_input_ini_conf = Ini::load_from_file(&tribes_input_ini_path).map_err(|e| e.to_string())?;

    for (composite_key, value) in updated_values {
        let parts: Vec<&str> = composite_key.split(':').collect();
        if parts.len() == 2 {
            let section = parts[0];
            let key = parts[1];

            // Determine which file to update based on the presence of the section
            if tribes_ini_conf.section(Some(section)).is_some() {
                tribes_ini_conf.with_section(Some(section)).set(key, &value);
            } else if tribes_input_ini_conf.section(Some(section)).is_some() {
                tribes_input_ini_conf.with_section(Some(section)).set(key, &value);
            }
        }
    }

    tribes_ini_conf.write_to_file(&tribes_ini_path).map_err(|e| e.to_string())?;
    tribes_input_ini_conf.write_to_file(&tribes_input_ini_path).map_err(|e| e.to_string())?;

    Ok(())
}
