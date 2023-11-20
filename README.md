# ta-launcher
[W.I.P] Launcher to start the game on community servers, inject TAMods, and manage community maps.

This project is a Tauri application using Rust for the backend, and React for the frontend. 
Follow these instructions to set up and run the application on your system.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/)

## Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Dylan-B-D/ta-launcher
   cd ta-launcher

2. **Install Dependencies:**
   ```bash
   npm install

3. **Set Rust Mode to Nighlty:**

    The injector used requires Rust Nightly to function. 
    If you don't have the Rust Nightly toolchain installed, you can use:

   ```bash
   rustup install nightly
    ```
    To set this specific project to use Rust Nightly using the command:
    
   ```bash
   rustup override set nightly

4. **Install Tauri CLI:**
   ```bash
   npm install -g @tauri-apps/cli

5. **Run in Development Mode:**
   ```bash
   npx tauri dev

6. **Build Executable:**
   ```bash
   npx tauri build
  
The executable will output to the `\src-tauri\target\release` folder.

