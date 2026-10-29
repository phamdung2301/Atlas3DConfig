# Atlas 3D Configurator

A real-time 3D product configurator: build a lounge chair in the browser —
swap materials, colors, legs, armrests and sizes, watch the price update
live, and share the exact configuration as a link.

## What it is (and is not)

- **It is:** a working demo configurator built to replace a placeholder
  project card on a portfolio. The chair is procedural (built from
  primitives + PBR materials, no external model files), so it always loads.
- **It is not:** a store. The product is fictional and prices are demo
  figures in USD. There is no cart, checkout, or account system.
- **Performance claims:** this README makes no FPS claim. Turn on the
  "Show live FPS meter" toggle in the panel and measure on your own
  device — that number is the honest one.

## Stack

- Vite + React 19 + React Three Fiber + drei
- zustand for configuration state (synced to the URL `?c=…` and
  localStorage, so a shared link reopens the same chair)
- three.js GLTFLoader with the Draco + KTX2 pipeline for the
  "Try your own GLB" tester (decoders/transcoders load from the standard
  public paths; a failed load shows an error instead of crashing)

## Features

- Part-by-part configuration: upholstery material (bouclé, linen, velvet,
  Nappa leather), 6 colors, 3 leg styles, armrests on/off, 3 sizes
- A real rule: walnut legs are not offered on the wide (L) frame — the
  option disables with an explanation, and picking L auto-switches to
  steel
- Live pricing with a per-option breakdown
- Orbit / zoom / auto-rotate, 4 camera presets, exploded view, 3 studios
- 3 presets (Scandi, Moody, Lux), PNG snapshot download, shareable link
- Mobile layout (panel becomes a bottom section), reduced-motion
  respected for auto-rotate, WebGL failure shows a fallback instead of
  a white page

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

## Project layout

```
src/
├── data/config.js        # product data, materials, prices, rules, presets
├── store/useConfig.js    # zustand store + URL/localStorage persistence
├── components/
│   ├── Chair.jsx         # procedural lounge chair (parts + PBR materials)
│   ├── Scene.jsx         # canvas, lights, camera flights, FPS meter, GLB loader
│   ├── ConfigPanel.jsx   # the right-hand configuration panel
│   └── ErrorBoundary.jsx # WebGL/GLB failure fallback
└── App.jsx               # header + stage + panel layout
```
