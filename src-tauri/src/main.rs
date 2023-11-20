// main.rs

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
use commands::{
    inject_command, 
    launch_game_command, 
    fetch_players_command, 
    fetch_packages_command, 
    downloader_command,
    find_executable_command,
    get_available_fonts_command,
    util_command,
    log_cleaner_command,
    directory_shortcuts_command,
    config_parser_command,
};
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, Window};
use tauri::Manager;

fn toggle_visibility( window : Window){
    if window.is_visible().expect("winvis") {
        window.hide().unwrap();
    } else {
        window.show().unwrap();
        window.unminimize().unwrap();
        window.set_focus().unwrap();
    }
}

fn main() {
    // Quit, show, launch game.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
    .add_item(show)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit);

    let system_tray = SystemTray::new()

    .with_menu(tray_menu);
    // Tauri app builder and run
    tauri::Builder::default().on_window_event(|event| match event.event() {
        tauri::WindowEvent::CloseRequested { api, .. } => {
        event.window().hide().unwrap();
        api.prevent_close();
        }
        _ => {}
    })
    .system_tray(system_tray)
    .on_system_tray_event(|app, event| match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
            } => {
                let window = app.get_window("main").unwrap();
                toggle_visibility(window)
            }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "show" => {
                let window = app.get_window("main").unwrap();
                toggle_visibility(window)
            }
            //TODO Add "play" option which grabs launchType and starts game
            _ => {}
            }
        }
        _ => {}
    })
    .invoke_handler(tauri::generate_handler![
        inject_command::inject,
        launch_game_command::launch_game,
        launch_game_command::launch_game_non_steam,
        fetch_players_command::fetch_players_online,
        fetch_packages_command::fetch_package_metadata,
        fetch_packages_command::fetch_packages,
        fetch_packages_command::fetch_dependency_tree,
        downloader_command::download_package,
        find_executable_command:: find_executable,
        get_available_fonts_command::get_system_fonts,
        util_command::is_process_running,
        util_command::is_pid_running,
        util_command::get_process_pid,
        log_cleaner_command::check_directory_stats,
        log_cleaner_command::clear_log_folder,
        directory_shortcuts_command::open_config_dir,
        directory_shortcuts_command::open_routes_sub_dir,
        directory_shortcuts_command::open_hud_modules_sub_dir,
        directory_shortcuts_command::open_launcher_dir,
        config_parser_command::parse_tribes_ini,
        config_parser_command::parse_tribes_input_ini,
        config_parser_command::update_ini_file,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
