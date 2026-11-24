use crate::storage::{encode_base64, AppState};
use serde_json::{json, Value};
use std::fs;
use std::process::Command;
use std::time::Instant;

pub fn find_compiler(state: &AppState) -> Value {
    let bin_name = if cfg!(target_os = "windows") {
        "tectonic.exe"
    } else {
        "tectonic"
    };

    let mut candidates = vec![state.workspace_dir.join("bin").join(bin_name)];
    if let Some(parent) = &state.parent_repo_dir {
        candidates.push(parent.join("bin").join(bin_name));
    }

    for cand in candidates {
        if cand.is_file() {
            let ver = Command::new(&cand)
                .arg("--version")
                .output()
                .ok()
                .and_then(|o| String::from_utf8(o.stdout).ok())
                .map(|s| s.trim().to_string())
                .unwrap_or_else(|| "Tectonic (standalone)".to_string());
            return json!({
                "available": true,
                "engine": "tectonic",
                "path": cand.to_string_lossy(),
                "version": ver
            });
        }
    }

    for cmd in ["tectonic", "pdflatex", "xelatex", "lualatex"] {
        if let Ok(out) = Command::new(cmd).arg("--version").output() {
            if out.status.success() {
                let first_line = String::from_utf8_lossy(&out.stdout)
                    .lines()
                    .next()
                    .unwrap_or(cmd)
                    .trim()
                    .to_string();
                return json!({
                    "available": true,
                    "engine": cmd,
                    "path": cmd,
                    "version": first_line
                });
            }
        }
    }

    json!({
        "available": false,
        "engine": Value::Null,
        "path": Value::Null,
        "version": "Not installed"
    })
}

pub fn compile_latex_sync(state: &AppState, tex_source: &str, basename: &str) -> Value {
    let compiler = find_compiler(state);
    if !compiler
        .get("available")
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
    {
        return json!({
            "ok": false,
            "error": "No LaTeX compiler found. Click 'Install Tectonic' in the left sidebar to install the standalone compiler automatically.",
            "log": ""
        });
    }

    let build_dir = state.workspace_dir.join("build");
    let _ = fs::create_dir_all(&build_dir);

    let safe_base: String = basename
        .trim_end_matches(".pdf")
        .trim_end_matches(".tex")
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '-')
        .collect();
    let safe_base = if safe_base.is_empty() {
        "user_default_en_cv".to_string()
    } else {
        safe_base
    };

    let tex_path = build_dir.join(format!("{}.tex", safe_base));
    let pdf_path = build_dir.join(format!("{}.pdf", safe_base));
    if let Err(e) = fs::write(&tex_path, tex_source) {
        return json!({
            "ok": false,
            "error": format!("Failed to write .tex file: {}", e),
            "log": ""
        });
    }

    let engine = compiler
        .get("engine")
        .and_then(|v| v.as_str())
        .unwrap_or("tectonic");
    let cmd_path = compiler
        .get("path")
        .and_then(|v| v.as_str())
        .unwrap_or("tectonic");

    let start = Instant::now();
    let output = if engine == "tectonic" {
        Command::new(cmd_path)
            .arg("-o")
            .arg(&build_dir)
            .arg(&tex_path)
            .current_dir(&state.workspace_dir)
            .output()
    } else {
        Command::new(cmd_path)
            .arg("-interaction=nonstopmode")
            .arg(format!("-output-directory={}", build_dir.to_string_lossy()))
            .arg(&tex_path)
            .current_dir(&state.workspace_dir)
            .output()
    };

    match output {
        Ok(out) => {
            let elapsed_ms = start.elapsed().as_millis() as u64;
            let log = format!(
                "{}\n{}",
                String::from_utf8_lossy(&out.stdout),
                String::from_utf8_lossy(&out.stderr)
            )
            .trim()
            .to_string();

            if out.status.success() && pdf_path.is_file() {
                match fs::read(&pdf_path) {
                    Ok(pdf_bytes) => {
                        let size_bytes = pdf_bytes.len();
                        let pdf_b64 = encode_base64(&pdf_bytes);
                        json!({
                            "ok": true,
                            "filename": format!("{}.pdf", safe_base),
                            "pdfPath": pdf_path.to_string_lossy(),
                            "pdfBase64": pdf_b64,
                            "sizeBytes": size_bytes,
                            "elapsedMs": elapsed_ms,
                            "engine": compiler.get("version").and_then(|v| v.as_str()).unwrap_or("Tectonic"),
                            "log": log
                        })
                    }
                    Err(e) => json!({
                        "ok": false,
                        "error": format!("Compiled PDF could not be read: {}", e),
                        "log": log
                    }),
                }
            } else {
                json!({
                    "ok": false,
                    "error": format!("LaTeX compiler exited with status {}", out.status),
                    "log": log
                })
            }
        }
        Err(e) => json!({
            "ok": false,
            "error": format!("Failed to spawn LaTeX compiler: {}", e),
            "log": ""
        }),
    }
}

pub fn install_tectonic_sync(state: &AppState) -> Value {
    let bin_dir = state.workspace_dir.join("bin");
    let _ = fs::create_dir_all(&bin_dir);

    let output = if cfg!(target_os = "windows") {
        Command::new("powershell")
            .arg("-NoProfile")
            .arg("-Command")
            .arg("[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://drop-ps1.fullyjustified.net'))")
            .current_dir(&bin_dir)
            .output()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg("curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh && chmod +x tectonic")
            .current_dir(&bin_dir)
            .output()
    };

    match output {
        Ok(out) => {
            let log = format!(
                "{}\n{}",
                String::from_utf8_lossy(&out.stdout),
                String::from_utf8_lossy(&out.stderr)
            )
            .trim()
            .to_string();
            let info = find_compiler(state);
            let ok = info
                .get("available")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            json!({
                "ok": ok,
                "compiler": info,
                "log": log
            })
        }
        Err(e) => json!({
            "ok": false,
            "error": e.to_string()
        }),
    }
}
