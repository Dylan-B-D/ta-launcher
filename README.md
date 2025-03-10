# T:A Launcher V2

A launcher for Tribes: Ascend that has a first time setup to streamline the installation.


# Screenshots
![Screenshot 2](./images/config.png)
![Screenshot 3](./images/packages.png)
![Screenshot 1](./images/home.png)


## Improvements

- First time setup
- No longer requires admin to run
- Steam launching without pop-ups
- Auto updater
- In launcher config tools
- Route manager
- Server population counts
- Potential additions in the future may include (Integrated server hosting wizard and UDK setup for map making)

This project is a Tauri 2.0 application using Rust for the backend, and React for the frontend.
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

   ```

2. **Install Dependencies:**

   ```bash
   npm install

   ```

3. **Set Rust Mode to Nighlty:**

   Some tauri features used require Rust Nightly to function, these can be disabled in the Cargo.toml file if necessary.
   If you don't have the Rust Nightly toolchain installed, you can use:

   ```bash
   rustup install nightly
   ```

   To set this specific project to use Rust Nightly using the command:

   ```bash
   rustup override set nightly

   ```

4. **Install Tauri CLI:**

   ```bash
   npm install -g @tauri-apps/cli

   ```

5. **Run in Development Mode:**

   ```bash
   npx tauri dev

   ```

6. **Build Executable:**
   ```bash
   npx tauri build
   ```

The executable will output to the `\src-tauri\target\release` folder.
