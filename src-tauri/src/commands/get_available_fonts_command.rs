use font_loader::system_fonts;
use tauri::command;

#[command]
pub fn get_system_fonts() -> Vec<String> {
    let font_list = system_fonts::query_all();
    font_list
}
