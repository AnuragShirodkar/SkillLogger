# SkillLogger user guide

SkillLogger is a browser tool for **Vector / CANalyzer ASC** logs. You can view frames in a readable table, compare against the raw file, define signals, export a **DBC**, and chart decoded values. All processing stays on your computer.

## Start the app

### Browser

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://127.0.0.1:5173/`).

### Desktop window (recommended for daily use)

```bash
npm install
npm run desktop
```

This opens SkillLogger in its own window — you do not need Chrome/Edge. For a built UI:

```bash
npm run desktop:build
```

### USB / no Command Prompt

On a build PC:

```bash
npm run dist:portable
```

Copy `release/SkillLogger-Portable-1.0.0.exe` (or the `release/win-unpacked` folder) to a USB stick. On the target Windows PC, double-click the exe — no install, no CMD, no npm.

## First-time walkthrough

### 1. Import an ASC log

1. Go to **Import**.
2. Drop a `.asc` / `.txt` file, or click the dropzone to browse.
3. Or click **Load sample log** to try the built-in demo.

You should see file name, frame count, number base, and timestamp mode.

### 2. Raw vs readable (multi-tab)

Open **Frames**. Use the tabs:

| Tab | What you see |
|-----|----------------|
| **Readable** | Filterable table (time, channel, ID, Rx/Tx, DLC, data) + CSV export |
| **Raw ASC** | Original file text with line numbers |
| **Split view** | Raw and readable side by side |

Filters (CAN ID, channel, search) apply to the readable table.

### 3. Define messages and export DBC

1. Open **Decode and DBC**.
2. **Add** a message: name, CAN ID (hex), DLC, optional extended ID.
3. **Add signal**: name, start bit, length, byte order (Intel/Motorola), signedness, factor, offset, min/max, unit.
4. Click **Save** to keep definitions in this browser (`localStorage`).
5. Click **.dbc** / download to export a standard DBC file.

Signal IDs must match frame IDs in the log for decoding and charts to work.

### 4. Charts

1. Open **Charts** after importing a log and defining matching signals.
2. Select which signals to plot.
3. Review the ID rate overview.
4. Optionally **Export chart PNG**.

## Tips

- Demo definitions decode sample IDs `0x100` and `0x200`.
- Enter CAN IDs in hex in the editor (e.g. `100`, not `256`).
- Readable table is capped at 2,000 rows for performance — export CSV for the full set.
- Clearing site data removes saved DBC definitions.

## Supported input (v1)

- Vector / CANalyzer classic CAN ASC data lines
- Not yet: BLF / binary logs, auto reverse-engineering of signals
