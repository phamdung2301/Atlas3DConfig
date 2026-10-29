/**
 * Atlas 3D Configurator — single source of truth for the demo product.
 *
 * The product is FICTIONAL (a demo lounge chair, no real orders). Prices
 * are demo figures in USD. Nothing here is a claim about a real store.
 */

export const BASE_PRICE = 890

export const MATERIALS = {
  boucle: { label: 'Bouclé', delta: 0, roughness: 0.95, sheen: 0.6 },
  linen: { label: 'Linen', delta: 40, roughness: 0.9, sheen: 0.3 },
  velvet: { label: 'Velvet', delta: 90, roughness: 1, sheen: 1 },
  leather: { label: 'Nappa leather', delta: 180, roughness: 0.45, sheen: 0, clearcoat: 0.4 },
}

export const COLORS = [
  { id: 'cream', label: 'Cream', hex: '#E8E0D0' },
  { id: 'grey', label: 'Stone grey', hex: '#9AA0A6' },
  { id: 'moss', label: 'Moss', hex: '#5A6B57' },
  { id: 'clay', label: 'Terracotta', hex: '#B06A4A' },
  { id: 'ink', label: 'Ink', hex: '#232326' },
  { id: 'mustard', label: 'Mustard', hex: '#C9A227' },
]

export const LEGS = {
  wood: { label: 'Walnut legs', delta: 0 },
  metal: { label: 'Black steel legs', delta: 30 },
  sled: { label: 'Steel sled base', delta: 60 },
}

export const SIZES = {
  S: { label: 'S · Compact', scale: 0.9, delta: -80 },
  M: { label: 'M · Standard', scale: 1, delta: 0 },
  L: { label: 'L · Wide', scale: 1.12, delta: 150 },
}

export const ARMS_PRICE = 120

export const STUDIOS = {
  light: { label: 'Light studio', bg: '#e8e6e1', floor: '#d8d5cf' },
  dark: { label: 'Dark studio', bg: '#141416', floor: '#1e1e22' },
  wood: { label: 'Wood floor', bg: '#2a211a', floor: '#6b4a2f' },
}

export const VIEWS = {
  front: { label: 'Front', pos: [0, 0.9, 2.8], tgt: [0, 0.55, 0] },
  side: { label: 'Side', pos: [2.8, 0.9, 0.2], tgt: [0, 0.55, 0] },
  top: { label: 'Top', pos: [0, 3.2, 0.8], tgt: [0, 0.4, 0] },
  detail: { label: 'Detail', pos: [1.0, 0.75, 1.3], tgt: [0.1, 0.6, 0.1] },
}

export const PRESETS = {
  scandi: {
    label: 'Scandi',
    config: {
      material: 'boucle',
      color: 'cream',
      legs: 'wood',
      arms: true,
      size: 'M',
    },
  },
  moody: {
    label: 'Moody',
    config: {
      material: 'velvet',
      color: 'moss',
      legs: 'metal',
      arms: true,
      size: 'M',
    },
  },
  lux: {
    label: 'Lux',
    config: {
      material: 'leather',
      color: 'ink',
      legs: 'sled',
      arms: false,
      size: 'L',
    },
  },
}

export const DEFAULTS = {
  material: 'boucle',
  color: 'cream',
  legs: 'wood',
  arms: true,
  size: 'M',
  studio: 'light',
  autoRotate: true,
  exploded: false,
}

/**
 * Manufacturing rule (the configurator's rule engine, kept honest and
 * visible): walnut legs are not offered on the wide L frame — the wood
 * leg is not rated for that width. The UI disables the option and the
 * store auto-switches to steel when L is picked with wood legs.
 */
export function legsAllowed(size, legId) {
  if (size === 'L' && legId === 'wood') return false
  return true
}

export function priceOf(config) {
  const materialDelta = MATERIALS[config.material]?.delta ?? 0
  const legsDelta = LEGS[config.legs]?.delta ?? 0
  const sizeDelta = SIZES[config.size]?.delta ?? 0
  const armsDelta = config.arms ? ARMS_PRICE : 0
  const lines = [
    { label: 'Base chair', amount: BASE_PRICE },
    { label: MATERIALS[config.material]?.label ?? '', amount: materialDelta },
    { label: LEGS[config.legs]?.label ?? '', amount: legsDelta },
    { label: config.arms ? 'Armrests' : 'Armless', amount: armsDelta },
    { label: SIZES[config.size]?.label ?? '', amount: sizeDelta },
  ]
  return {
    lines,
    total: BASE_PRICE + materialDelta + legsDelta + armsDelta + sizeDelta,
  }
}

export function formatPrice(n) {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US')}`
}
