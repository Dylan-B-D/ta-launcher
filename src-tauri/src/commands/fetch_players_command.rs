// fetch_players.rs
use tauri::command;
use reqwest::Error as ReqwestError;
use serde_json::{Error as SerdeError, Value};

#[command]
pub async fn fetch_players_online() -> Result<String, String> {
    let dodge_url = "http://ta.dodgesdomain.com:9080/detailed_status";
    let kfk_url = "http://ta.kfk4ever.com:9080/detailed_status";

    let dodge_players = fetch_player_count(dodge_url).await.unwrap_or(0);
    let kfk_players = fetch_player_count(kfk_url).await.unwrap_or(0);

    let result = serde_json::json!({
        "PUG": dodge_players,
        "Community": kfk_players
    });

    Ok(result.to_string())
}

async fn fetch_player_count(url: &str) -> Result<usize, String> {
    let client = reqwest::Client::new();
    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    let text = response.text().await.map_err(|e| e.to_string())?;
    
    let json: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;

    // Assuming the player count is the length of "online_players_list"
    Ok(json["online_players_list"].as_array()
       .map_or(0, |players| players.len()))
}
