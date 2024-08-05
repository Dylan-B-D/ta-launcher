use super::data::{LOGIN_SERVER_COMMUNITY_DETAILS, LOGIN_SERVER_PUG_DETAILS};
use futures::future;
use serde_json::Value;
use tauri::command;

/// Fetches the number of players online on the PUG and Community servers, along with their names.
///
/// # Returns
///
/// A JSON object with the number of players and their names on the PUG and Community servers.
#[command]
pub async fn fetch_players_online() -> Result<serde_json::Value, String> {
    let (pug_players_data, community_players_data) = future::join(
        fetch_player_data(&LOGIN_SERVER_PUG_DETAILS),
        fetch_player_data(&LOGIN_SERVER_COMMUNITY_DETAILS),
    )
    .await;

    let (pug_count, pug_names) = pug_players_data.unwrap_or((0, vec![]));
    let (community_count, community_names) = community_players_data.unwrap_or((0, vec![]));

    let result = serde_json::json!({
        "PUG": {
            "count": pug_count,
            "names": pug_names
        },
        "Community": {
            "count": community_count,
            "names": community_names
        }
    });

    Ok(result)
}

/// Fetches the number of players online on the specified server along with their names.
///
/// # Arguments
///
/// * `url` - The URL of the server to fetch the player data from.
///
/// # Returns
///
/// A tuple containing the number of players online and a vector of their names.
async fn fetch_player_data(url: &str) -> Result<(usize, Vec<String>), String> {
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response text: {}", e))?;

    let json: Value =
        serde_json::from_str(&text).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    let players = json["online_players_list"]
        .as_array()
        .map_or(vec![], |list| {
            list.iter()
                .filter_map(|p| p.as_str().map(|s| s.to_string()))
                .collect()
        });

    Ok((players.len(), players))
}
