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

1. **Import** — drag/drop or browse for `.asc`; sample log under `public/samples/demo.asc`
2. **Frames** — filterable table (time, channel, ID, Rx/Tx, DLC, data) + CSV export
3. **Decode & DBC** — message/signal editor with `localStorage` persistence, `.dbc` download, multi-signal time series + PNG export, ID rate overview

## Notes

- Classic CAN data lines are supported (`timestamp channel id Rx|Tx d dlc data…`)
- Extended IDs use the ASC `…x` suffix
- Signal bit extraction supports Intel (little-endian) and Motorola (big-endian) layouts
