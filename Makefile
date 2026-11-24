# CV Manager — Tauri v2 + React + TypeScript Targets
.PHONY: dev build test desktop desktop-build check help

## dev: start the Vite + React frontend dev server at http://127.0.0.1:1420
dev:
	bun run dev

## desktop: launch the native Tauri v2 + React desktop app in development mode
desktop:
	bun run desktop:dev

## build: build the production React frontend bundle into dist/
build:
	bun run build

## desktop-build: build the native Tauri v2 release binary and OS installers
desktop-build:
	bun run desktop:build

## test: run the Vitest unit test suite
test:
	bun run test

## check: type-check TypeScript frontend and check Rust Tauri backend
check:
	bun run build && cargo check --manifest-path src-tauri/Cargo.toml
