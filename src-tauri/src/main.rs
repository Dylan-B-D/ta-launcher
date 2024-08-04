// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
use commands::{ 
    find_game_path::find_path,
    packages::fetch_packages,
    config_preset_manager::{ check_config, replace_config },
    config_manager::{ fetch_config_files, update_ini_file },
    package_downloader::download_package,
    fetch_player_counts::fetch_players_online,
    launch_game::launch_game,
    directory_shortcuts::open_directory,
    routes::{ delete_route_file, get_route_files, decode_route, python_route_decoder }
};

fn main() {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info) // Set the level for printing debug to console (Off, Warn, Info, Debug etc)
        .init();
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            find_path,
            fetch_packages,
            check_config,
            replace_config,
            fetch_config_files,
            update_ini_file,
            download_package,
            fetch_players_online,
            launch_game,
            open_directory,
            delete_route_file,
            get_route_files,
            decode_route,
            python_route_decoder
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
