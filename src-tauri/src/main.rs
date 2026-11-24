#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod compiler;
mod storage;

use std::sync::Arc;
use storage::{resolve_dirs, AppState};

fn main() {
    let (workspace_dir, parent_repo_dir) = resolve_dirs();
    let state = Arc::new(AppState {
        workspace_dir,
        parent_repo_dir,
    });

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::get_initial_state,
            commands::save_cv_data,
            commands::load_sample_template,
            commands::sync_tex_files,
            commands::compile_latex,
            commands::install_tectonic,
            commands::save_export_file,
            commands::open_in_system,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CV Manager desktop application");
}
