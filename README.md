# SkillLogger

Client-side **CAN ASC** toolkit: import Vector / CANalyzer `.asc` logs, inspect frames, define messages/signals in the UI, export a `.dbc`, and chart decoded signal values.

## Download (Windows)

**[Download SkillLogger Portable v1.0.0](https://github.com/AnuragShirodkar/SkillLogger/releases/download/v1.0.0/SkillLogger-Portable-1.0.0.exe)**

Or open the [Releases page](https://github.com/AnuragShirodkar/SkillLogger/releases/tag/v1.0.0). Double-click the exe — no install, no Command Prompt. 64-bit Windows only. If SmartScreen warns you: More info → Run anyway.

## Stack

- Vite + React + TypeScript
- Lucide icons
- Recharts

Everything runs in the browser — no backend required.

## Run locally

### In the browser

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://127.0.0.1:5173`).

### As a desktop app (no browser window)

Best for day-to-day use — same UI in its own window:

```bash
npm install
npm run desktop
```

### Portable USB / double-click (no Command Prompt)

Build a Windows portable app once on a machine that has Node.js:

```bash
npm install
npm run dist:portable
```

If packaging fails with a Windows `EPERM` rename error (antivirus locking files), build to a temp folder instead:

```bat
npm run build
set CSC_IDENTITY_AUTO_DISCOVERY=false
npx electron-builder --win portable --config.directories.output="%LOCALAPPDATA%\skilllogger-release"
```

Then copy from `release/` (or that temp folder):

- **`SkillLogger-Portable-1.0.0.exe`** (~75 MB) — single file for USB, or
- **`win-unpacked/`** folder — copy the whole folder to USB and run `SkillLogger.exe`

On another Windows PC: plug in the USB and **double-click** the exe. No `npm`, no Command Prompt, no internet required for the app itself.

Notes:

- Built for **64-bit Windows** (`x64`)
- First run on a new PC may show a SmartScreen warning (unsigned app) — choose More info → Run anyway
- This is **not** an API transfer over USB — it is the full SkillLogger desktop app, offline
- Do not commit `release/` binaries to Git (they are gitignored)

## Build

```bash
npm run build
npm run preview
```

## Features

1. **User guide** — in-app walkthrough for first-time users (`USER_GUIDE.md` on GitHub)
2. **Import** — drag/drop or browse for `.asc`; sample log under `public/samples/demo.asc`
3. **Frames** — multi-tab **Readable** / **Raw ASC** / **Split view**, filters, CSV export
4. **Decode & DBC** — message/signal editor with `localStorage` persistence and `.dbc` download
5. **Charts** — multi-signal time series + PNG export, ID rate overview

## New users

See the **Guide** section in the app, or read [USER_GUIDE.md](USER_GUIDE.md).

## Notes

- Classic CAN data lines are supported (`timestamp channel id Rx|Tx d dlc data…`)
- Extended IDs use the ASC `…x` suffix
- Signal bit extraction supports Intel (little-endian) and Motorola (big-endian) layouts
