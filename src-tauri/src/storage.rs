use serde_json::{json, Value};
use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::PathBuf;

pub const EMBEDDED_SAMPLE_JSON: &str = include_str!("../../data/sample_cv_data.json");

pub struct AppState {
    pub workspace_dir: PathBuf,
    pub parent_repo_dir: Option<PathBuf>,
}

pub fn resolve_dirs() -> (PathBuf, Option<PathBuf>) {
    if let Ok(cwd) = env::current_dir() {
        // Running inside CVManager/ or CVManager/src-tauri/
        if cwd.join("data").is_dir() && cwd.join("src-tauri").is_dir() {
            let parent = cwd.parent().map(|p| p.to_path_buf());
            return (cwd, parent);
        }
        if let Some(parent) = cwd.parent() {
            if parent.join("data").is_dir() && parent.join("src-tauri").is_dir() {
                let grandparent = parent.parent().map(|p| p.to_path_buf());
                return (parent.to_path_buf(), grandparent);
            }
        }
        // Running from root cv_generator/ where CVManager/ is a subdirectory
        if cwd.join("CVManager").is_dir() {
            return (cwd.join("CVManager"), Some(cwd));
        }
    }

    // Fallback to OS AppData directory for installed public desktop binary
    let base = if cfg!(target_os = "macos") {
        env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."))
            .join("Library")
            .join("Application Support")
            .join("cv-manager")
    } else if cfg!(target_os = "windows") {
        env::var("APPDATA")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("."))
            .join("cv-manager")
    } else {
        env::var("XDG_DATA_HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                env::var("HOME")
                    .map(PathBuf::from)
                    .unwrap_or_else(|_| PathBuf::from("."))
                    .join(".local")
                    .join("share")
            })
            .join("cv-manager")
    };

    let _ = fs::create_dir_all(base.join("data"));
    let _ = fs::create_dir_all(base.join("build"));
    let _ = fs::create_dir_all(base.join("bin"));
    (base, None)
}

pub fn data_file_path(state: &AppState) -> PathBuf {
    state.workspace_dir.join("data").join("cv_data.json")
}

pub fn load_active_cv_data(state: &AppState) -> Value {
    let data_file = data_file_path(state);
    if !data_file.exists() {
        if let Some(parent) = data_file.parent() {
            let _ = fs::create_dir_all(parent);
        }
        // Try seeding from parent repo ../data/cv_data.json first if present
        let mut seeded = false;
        if let Some(parent_repo) = &state.parent_repo_dir {
            let parent_cv = parent_repo.join("data").join("cv_data.json");
            if parent_cv.is_file() {
                if fs::copy(&parent_cv, &data_file).is_ok() {
                    seeded = true;
                }
            }
        }
        if !seeded {
            let _ = fs::write(&data_file, EMBEDDED_SAMPLE_JSON);
        }
    }
    if let Ok(raw) = fs::read_to_string(&data_file) {
        if let Ok(val) = serde_json::from_str::<Value>(&raw) {
            return val;
        }
    }
    serde_json::from_str::<Value>(EMBEDDED_SAMPLE_JSON).unwrap_or_else(|_| json!({}))
}

pub fn save_active_cv_data(state: &AppState, data: &Value) -> Result<String, String> {
    if data.get("profile").is_none() {
        return Err("Invalid CV data payload: missing 'profile' key".to_string());
    }
    let data_file = data_file_path(state);
    if let Some(parent) = data_file.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let pretty = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    let tmp_file = data_file.with_extension("json.tmp");
    fs::write(&tmp_file, &pretty).map_err(|e| e.to_string())?;
    fs::rename(&tmp_file, &data_file).map_err(|e| e.to_string())?;

    // Also mirror auto-save to parent repo ../data/cv_data.json if running inside repo
    if let Some(parent_repo) = &state.parent_repo_dir {
        let parent_data_dir = parent_repo.join("data");
        if parent_data_dir.is_dir() {
            let parent_cv = parent_data_dir.join("cv_data.json");
            let parent_tmp = parent_cv.with_extension("json.tmp");
            if fs::write(&parent_tmp, &pretty).is_ok() {
                let _ = fs::rename(&parent_tmp, &parent_cv);
            }
        }
    }

    Ok(data_file.to_string_lossy().to_string())
}

pub fn write_synced_tex_files(
    state: &AppState,
    main_tex: &str,
    body_files: &HashMap<String, String>,
) -> Result<Vec<String>, String> {
    let mut written = Vec::new();
    let main_path = state.workspace_dir.join("main.tex");
    fs::write(&main_path, main_tex).map_err(|e| format!("Failed writing main.tex: {}", e))?;
    written.push("main.tex".to_string());

    let mut codes: Vec<&String> = body_files.keys().collect();
    codes.sort();
    for code in codes {
        if let Some(content) = body_files.get(code) {
            let safe_code: String = code
                .chars()
                .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
                .collect();
            if !safe_code.is_empty() {
                let fname = format!("cv_latex_{}.tex", safe_code);
                let fpath = state.workspace_dir.join(&fname);
                fs::write(&fpath, content)
                    .map_err(|e| format!("Failed writing {}: {}", fname, e))?;
                written.push(fname);
            }
        }
    }
    Ok(written)
}

const B64_CHARS: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

pub fn encode_base64(input: &[u8]) -> String {
    let mut out = String::with_capacity(((input.len() + 2) / 3) * 4);
    for chunk in input.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;

        out.push(B64_CHARS[((triple >> 18) & 0x3F) as usize] as char);
        out.push(B64_CHARS[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            out.push(B64_CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(B64_CHARS[(triple & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

pub fn decode_base64(input: &str) -> Result<Vec<u8>, String> {
    let mut table = [255u8; 256];
    for (i, &b) in B64_CHARS.iter().enumerate() {
        table[b as usize] = i as u8;
    }
    let clean: Vec<u8> = input
        .bytes()
        .filter(|b| !b.is_ascii_whitespace() && *b != b'=')
        .collect();
    let mut out = Vec::with_capacity((clean.len() * 3) / 4);
    for chunk in clean.chunks(4) {
        if chunk.len() < 2 {
            break;
        }
        let v0 = table[chunk[0] as usize];
        let v1 = table[chunk[1] as usize];
        if v0 == 255 || v1 == 255 {
            return Err("Invalid base64 character".to_string());
        }
        out.push((v0 << 2) | (v1 >> 4));
        if chunk.len() > 2 {
            let v2 = table[chunk[2] as usize];
            if v2 == 255 {
                return Err("Invalid base64 character".to_string());
            }
            out.push((v1 << 4) | (v2 >> 2));
            if chunk.len() > 3 {
                let v3 = table[chunk[3] as usize];
                if v3 == 255 {
                    return Err("Invalid base64 character".to_string());
                }
                out.push((v2 << 6) | v3);
            }
        }
    }
    Ok(out)
}
