use once_cell::sync::Lazy;
use std::path::PathBuf;

// Note: AppData Local dir, and tribes dir, are currently passed from the frontend

/// Store the name and default path of a config file.
pub struct ConfigFileInfo {
    pub name: &'static str,
    pub default_path: &'static str,
}

pub const PKG_ENDPOINT: &str = "https://client.update.tamods.org/";             // The endpoint for downloading packages
pub const PKG_CFG_FILE: &str = "packageconfig.yaml";                            // File that contains package list and dependencies

pub static DOCS_DIR: Lazy<PathBuf> = Lazy::new(|| {                             // The user's documents directory
    dirs::document_dir().expect("Failed to get documents directory")
});

pub static CONFIG_DIR: Lazy<PathBuf> = Lazy::new(|| {                           // The Tribes config directory
    DOCS_DIR.join("My Games")
            .join("Tribes Ascend")
            .join("TribesGame")
            .join("config")
});

/// A list of default config files to use if defaults do not exist.
pub const CONFIG_FILES: [ConfigFileInfo; 4] = [
    ConfigFileInfo { name: "tribes.ini", default_path: "../public/configs/defaultini/tribes.ini" }, // Default but: Disabled Vsync, motion blur, and set force static terrain to true
    ConfigFileInfo { name: "TribesInput.ini", default_path: "../public/configs/defaultinput/TribesInput.ini" }, // Default but: Reduced mouse sensitivity to 10 from 30
    ConfigFileInfo { name: "TribesHelpText.ini", default_path: "../public/configs/defaulttribeshelptext/TribesHelpText.ini" }, // Disabled help text by default
    ConfigFileInfo { name: "TribesUser.ini", default_path: "../public/configs/defaulttribesuser/TribesUser.ini" },  // Default
];

pub const LOGIN_SERVER_PUG: &str = "ta.dodgesdomain.com";
pub const LOGIN_SERVER_COMMUNITY: &str = "ta.kfk4ever.com:9080";

pub static LOGIN_SERVER_PUG_DETAILS: Lazy<String> = Lazy::new(|| {
    format!("http://{}:9080/detailed_status", LOGIN_SERVER_PUG)
});

pub static LOGIN_SERVER_COMMUNITY_DETAILS: Lazy<String> = Lazy::new(|| {
    format!("http://{}/detailed_status", LOGIN_SERVER_COMMUNITY)
});