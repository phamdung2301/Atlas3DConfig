import { create } from 'zustand'
import { DEFAULTS, PRESETS, legsAllowed } from '../data/config.js'

const SAVED_KEYS = [
  'material',
  'color',
  'legs',
  'arms',
  'size',
  'studio',
  'autoRotate',
  'exploded',
]

function pickSaved(state) {
  const out = {}
  for (const k of SAVED_KEYS) out[k] = state[k]
  return out
}

function sanitize(input) {
  if (!input || typeof input !== 'object') return null
  const merged = { ...DEFAULTS, ...input }
  if (!legsAllowed(merged.size, merged.legs)) merged.legs = 'metal'
  return pickSaved(merged)
}

/** Config encoded in the URL (?c=…) so a shared link opens the same chair. */
function encodeConfig(state) {
  try {
    return btoa(JSON.stringify(pickSaved(state)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch {
    return ''
  }
}

function decodeConfig(raw) {
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/')
    return sanitize(JSON.parse(atob(normalized)))
  } catch {
    return null
  }
}

function loadInitial() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('c')
    if (fromUrl) {
      const decoded = decodeConfig(fromUrl)
      if (decoded) return decoded
    }
    const fromLocal = window.localStorage.getItem('atlas-config')
    if (fromLocal) {
      const parsed = sanitize(JSON.parse(fromLocal))
      if (parsed) return parsed
    }
  } catch {
    // Corrupt storage/URL falls through to defaults.
  }
  return { ...DEFAULTS }
}

function persist(state) {
  try {
    window.localStorage.setItem('atlas-config', JSON.stringify(pickSaved(state)))
    const url = new URL(window.location.href)
    url.searchParams.set('c', encodeConfig(state))
    window.history.replaceState(null, '', url)
  } catch {
    // Private mode / blocked storage must not break the app.
  }
}

export const useConfig = create((set, get) => ({
  ...loadInitial(),
  viewGoal: null,
  glbUrl: null,
  glbError: null,
  showFps: false,

  set: (patch) => {
    set(patch)
    persist(get())
  },

  setSize: (size) => {
    const patch = { size }
    // Rule: wide frame cannot keep walnut legs — switch to steel and
    // let the panel explain why (see ConfigPanel rule note).
    if (!legsAllowed(size, get().legs)) patch.legs = 'metal'
    set(patch)
    persist(get())
  },

  setLegs: (legs) => {
    set({ legs })
    persist(get())
  },

  applyPreset: (name) => {
    const preset = PRESETS[name]
    if (!preset) return
    set({ ...preset.config })
    persist(get())
  },

  setView: (name) => set({ viewGoal: name }),
  clearViewGoal: () => set({ viewGoal: null }),
  setGlb: (url) => set({ glbUrl: url, glbError: null }),
  clearGlb: () => set({ glbUrl: null, glbError: null }),
  setGlbError: (msg) => set({ glbError: msg, glbUrl: null }),
  setShowFps: (showFps) => set({ showFps }),
}))
