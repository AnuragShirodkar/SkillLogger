# SkillLogger

Client-side **CAN ASC** toolkit: import Vector / CANalyzer `.asc` logs, inspect frames, define messages/signals in the UI, export a `.dbc`, and chart decoded signal values.

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

After a production build:

```bash
npm run desktop:build
```

A plain **CLI** would not fit SkillLogger well (tables, DBC editor, and charts need a GUI). Desktop Electron keeps the full app offline on your PC.

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
