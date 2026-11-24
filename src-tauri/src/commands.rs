use crate::compiler::{compile_latex_sync, find_compiler, install_tectonic_sync};
use crate::storage::{
    decode_base64, load_active_cv_data, save_active_cv_data, write_synced_tex_files, AppState,
    EMBEDDED_SAMPLE_JSON,
};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn get_initial_state(state: State<'_, Arc<AppState>>) -> Result<Value, String> {
    let data = load_active_cv_data(&state);
    let compiler = find_compiler(&state);
    Ok(json!({
        "ok": true,
        "data": data,
        "compiler": compiler,
        "workspace": state.workspace_dir.to_string_lossy()
    }))
}

#[tauri::command]
pub fn save_cv_data(state: State<'_, Arc<AppState>>, data: Value) -> Result<Value, String> {
    let saved_path = save_active_cv_data(&state, &data)?;
    Ok(json!({
        "ok": true,
        "path": saved_path
    }))
}

#[tauri::command]
pub fn load_sample_template() -> Result<Value, String> {
    let sample: Value =
        serde_json::from_str(EMBEDDED_SAMPLE_JSON).map_err(|e| e.to_string())?;
    Ok(json!({
        "ok": true,
        "data": sample
    }))
}

#[tauri::command]
pub fn sync_tex_files(
    state: State<'_, Arc<AppState>>,
    data: Option<Value>,
    main_tex: String,
    body_files: HashMap<String, String>,
) -> Result<Value, String> {
    if let Some(d) = data {
        let _ = save_active_cv_data(&state, &d);
    }
    let written = write_synced_tex_files(&state, &main_tex, &body_files)?;
    Ok(json!({
        "ok": true,
        "written": written,
        "workspace": state.workspace_dir.to_string_lossy()
    }))
}

#[tauri::command]
pub async fn compile_latex(
    state: State<'_, Arc<AppState>>,
    tex_source: String,
    basename: String,
    data: Option<Value>,
    main_tex: Option<String>,
    body_files: Option<HashMap<String, String>>,
) -> Result<Value, String> {
    let st = Arc::clone(&state);
    tauri::async_runtime::spawn_blocking(move || {
        if let Some(d) = &data {
            let _ = save_active_cv_data(&st, d);
        }
        if let (Some(m), Some(b)) = (&main_tex, &body_files) {
            let _ = write_synced_tex_files(&st, m, b);
        }
        compile_latex_sync(&st, &tex_source, &basename)
    })
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_tectonic(state: State<'_, Arc<AppState>>) -> Result<Value, String> {
    let st = Arc::clone(&state);
    tauri::async_runtime::spawn_blocking(move || install_tectonic_sync(&st))
        .await
        .map_err(|e| e.to_string())
}

fn prompt_native_save_dialog(default_dir: &PathBuf, filename: &str) -> Option<PathBuf> {
    let default_path = default_dir.join(filename);
    let default_str = default_path.to_string_lossy().to_string();

    if cfg!(target_os = "linux") {
        // Try zenity first, then kdialog
        if let Ok(out) = Command::new("zenity")
            .arg("--file-selection")
            .arg("--save")
            .arg("--confirm-overwrite")
            .arg(format!("--filename={}", default_str))
            .output()
        {
            if out.status.success() {
                let picked = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !picked.is_empty() {
                    return Some(PathBuf::from(picked));
                }
            } else if out.status.code() == Some(1) {
                // User explicitly cancelled zenity dialog
                return Some(PathBuf::new());
            }
        }
        if let Ok(out) = Command::new("kdialog")
            .arg("--getsavefilename")
            .arg(&default_str)
            .output()
        {
            if out.status.success() {
                let picked = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !picked.is_empty() {
                    return Some(PathBuf::from(picked));
                }
            } else if out.status.code() == Some(1) {
                return Some(PathBuf::new());
            }
        }
    } else if cfg!(target_os = "macos") {
        let script = format!(
            "POSIX path of (choose file name with prompt \"Save File As\" default name \"{}\")",
            filename.replace('"', "")
        );
        if let Ok(out) = Command::new("osascript").arg("-e").arg(&script).output() {
            if out.status.success() {
                let picked = String::from_utf8_lossy(&out.stdout).trim().to_string();
                if !picked.is_empty() {
                    return Some(PathBuf::from(picked));
                }
            } else {
                return Some(PathBuf::new());
            }
        }
    }

    None
}

#[tauri::command]
pub async fn save_export_file(
    state: State<'_, Arc<AppState>>,
    filename: String,
    content: String,
    is_base64: bool,
    use_dialog: Option<bool>,
) -> Result<Value, String> {
    let st = Arc::clone(&state);
    tauri::async_runtime::spawn_blocking(move || {
        let downloads_dir = env::var("HOME")
            .or_else(|_| env::var("USERPROFILE"))
            .map(|h| PathBuf::from(h).join("Downloads"))
            .ok()
            .filter(|p| p.is_dir())
            .unwrap_or_else(|| st.workspace_dir.join("build"));

        let target_path = if use_dialog.unwrap_or(true) {
            match prompt_native_save_dialog(&downloads_dir, &filename) {
                Some(p) if p.as_os_str().is_empty() => {
                    return Ok(json!({ "ok": false, "cancelled": true }));
                }
                Some(p) => p,
                None => downloads_dir.join(&filename),
            }
        } else {
            downloads_dir.join(&filename)
        };

        if let Some(parent) = target_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let bytes = if is_base64 {
            decode_base64(&content)?
        } else {
            content.into_bytes()
        };

        fs::write(&target_path, &bytes).map_err(|e| format!("Failed to save file: {}", e))?;

        Ok(json!({
            "ok": true,
            "cancelled": false,
            "savedPath": target_path.to_string_lossy(),
            "sizeBytes": bytes.len()
        }))
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub fn open_in_system(path: String) -> Result<Value, String> {
    let target = PathBuf::from(&path);
    if !target.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let res = if cfg!(target_os = "macos") {
        Command::new("open").arg(&target).spawn()
    } else if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
    } else {
        Command::new("xdg-open").arg(&target).spawn()
    };

    match res {
        Ok(_) => Ok(json!({ "ok": true })),
        Err(e) => Err(format!("Failed to open in system viewer: {}", e)),
    }
}
