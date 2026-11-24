# CV Manager — Native Tauri v2 + React + TypeScript Desktop App

**CV Manager** is the clean-slate **Tauri v2 (Rust) + React 19 + TypeScript + Tailwind CSS + Vite** desktop studio for crafting, translating, and tailoring single-page LaTeX CVs.

## 🚀 Quick Start

```bash
cd CVManager

# 1. Install frontend dependencies
bun install   # or: npm install

# 2. Run the native Tauri v2 desktop app with React HMR
bun run desktop:dev   # or: npm run desktop:dev

# 3. Run unit tests
bun run test

# 4. Build production desktop binary & installers
bun run desktop:build
```

## ✨ What Changed From the Legacy Web App

- **Native Tauri v2 IPC (`#[tauri::command]`)**: Eliminated the raw localhost TCP HTTP server hack (`127.0.0.1:18420`) and `WebviewUrl::External`. Uses `WebviewUrl::App` with typed Rust commands (`get_initial_state`, `save_cv_data`, `sync_tex_files`, `compile_latex`, `save_export_file`, `open_in_system`, `install_tectonic`).
- **React 19 + TypeScript + Zustand Architecture**: Modular components in `src/components/`, strict schema types in `src/types/cv.ts`, and a single source of truth for LaTeX generation in `src/lib/latex-generator.ts`.
- **Cross-Platform PDF.js Canvas Viewer**: Renders compiled PDFs directly onto high-DPI HTML5 `<canvas>` pages via `pdfjs-dist` so PDF previews work reliably on Linux (`WebKitGTK`), macOS (`WKWebView`), and Windows (`WebView2`), with native OS Save As dialogs and system PDF viewer integration.
