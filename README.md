# SkillLogger

Client-side **CAN ASC** toolkit: import Vector / CANalyzer `.asc` logs, inspect frames, define messages/signals in the UI, export a `.dbc`, and chart decoded signal values.

## Stack

- Vite + React + TypeScript
- Lucide icons
- Recharts

Everything runs in the browser — no backend required.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

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
