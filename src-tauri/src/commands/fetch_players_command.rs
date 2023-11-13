// fetch_players.rs
use tauri::command;

#[command]
pub async fn fetch_players_online() -> Result<String, String> {
    let url = "http://ta.dodgesdomain.com:9080/detailed_status";
    let client = reqwest::Client::new();
    match client.get(url).send().await {
        Ok(response) => match response.text().await {
            Ok(text) => Ok(text),
            Err(e) => Err(e.to_string()),
        },
        Err(e) => Err(e.to_string()),
    }
}