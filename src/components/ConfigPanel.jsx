import { useState } from 'react'
import {
  ARMS_PRICE,
  COLORS,
  LEGS,
  MATERIALS,
  PRESETS,
  SIZES,
  STUDIOS,
  VIEWS,
  formatPrice,
  legsAllowed,
  priceOf,
} from '../data/config.js'
import { useConfig } from '../store/useConfig.js'

export default function ConfigPanel() {
  const config = useConfig()
  const [copied, setCopied] = useState(false)
  const [glbText, setGlbText] = useState('')
  const { lines, total } = priceOf(config)
  const colorName = COLORS.find((c) => c.id === config.color)?.label ?? ''
  const woodBlocked = config.size === 'L'

  const snapshot = () => {
    const canvas = document.querySelector('.stage canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'atlas-chair.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const loadGlbFile = (file) => {
    if (!file) return
    config.setGlb(URL.createObjectURL(file))
  }

  return (
    <div className="panel">
      <section>
        <h2>Presets</h2>
        <div className="row">
          {Object.entries(PRESETS).map(([id, p]) => (
            <button key={id} className="opt" onClick={() => config.applyPreset(id)}>
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Upholstery material</h2>
        <div className="row">
          {Object.entries(MATERIALS).map(([id, m]) => (
            <button
              key={id}
              className={`opt${config.material === id ? ' active' : ''}`}
              onClick={() => config.set({ material: id })}
            >
              {m.label}
              <small>{m.delta === 0 ? 'Included' : `+${formatPrice(m.delta)}`}</small>
            </button>
          ))}
        </div>
        <p className="note" style={{ color: '#9a9aa2' }}>
          Applies to seat, back and arm cushions.
        </p>
      </section>

      <section>
        <h2>Color — {colorName}</h2>
        <div className="row">
          {COLORS.map((c) => (
            <button
              key={c.id}
              className={`swatch${config.color === c.id ? ' active' : ''}`}
              style={{ background: c.hex }}
              aria-label={c.label}
              title={c.label}
              onClick={() => config.set({ color: c.id })}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>Legs</h2>
        <div className="row">
          {Object.entries(LEGS).map(([id, l]) => {
            const blocked = !legsAllowed(config.size, id)
            return (
              <button
                key={id}
                className={`opt${config.legs === id ? ' active' : ''}`}
                disabled={blocked}
                title={blocked ? 'Not rated for the wide frame' : undefined}
                onClick={() => config.setLegs(id)}
              >
                {l.label}
                <small>{l.delta === 0 ? 'Included' : `+${formatPrice(l.delta)}`}</small>
              </button>
            )
          })}
        </div>
        {woodBlocked && (
          <p className="note">
            Walnut legs are not rated for the wide (L) frame, so steel is
            selected instead.
          </p>
        )}
      </section>

      <section>
        <h2>Armrests</h2>
        <div className="row">
          <button
            className={`opt${config.arms ? ' active' : ''}`}
            onClick={() => config.set({ arms: true })}
          >
            With armrests<small>+{formatPrice(ARMS_PRICE)}</small>
          </button>
          <button
            className={`opt${!config.arms ? ' active' : ''}`}
            onClick={() => config.set({ arms: false })}
          >
            Armless<small>Included</small>
          </button>
        </div>
      </section>

      <section>
        <h2>Size</h2>
        <div className="row">
          {Object.entries(SIZES).map(([id, s]) => (
            <button
              key={id}
              className={`opt${config.size === id ? ' active' : ''}`}
              onClick={() => config.setSize(id)}
            >
              {s.label}
              <small>
                {s.delta === 0
                  ? 'Included'
                  : s.delta < 0
                    ? formatPrice(s.delta)
                    : `+${formatPrice(s.delta)}`}
              </small>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Studio</h2>
        <div className="row">
          {Object.entries(STUDIOS).map(([id, s]) => (
            <button
              key={id}
              className={`opt${config.studio === id ? ' active' : ''}`}
              onClick={() => config.set({ studio: id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Camera</h2>
        <div className="row">
          {Object.entries(VIEWS).map(([id, v]) => (
            <button key={id} className="opt" onClick={() => config.setView(id)}>
              {v.label}
            </button>
          ))}
        </div>
        <div style={{ height: 10 }} />
        <label className="toggle">
          <input
            type="checkbox"
            checked={config.autoRotate}
            onChange={(e) => config.set({ autoRotate: e.target.checked })}
          />
          Slow auto-rotate
        </label>
        <div style={{ height: 8 }} />
        <label className="toggle">
          <input
            type="checkbox"
            checked={config.exploded}
            onChange={(e) => config.set({ exploded: e.target.checked })}
          />
          Exploded view
        </label>
      </section>

      <section>
        <h2>Summary</h2>
        <table className="spec">
          <tbody>
            {lines.map((l) => (
              <tr key={l.label}>
                <td>{l.label}</td>
                <td>
                  {l.amount === 0
                    ? 'Included'
                    : l.amount < 0
                      ? formatPrice(l.amount)
                      : `+${formatPrice(l.amount)}`}
                </td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td>{formatPrice(total)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <button className="cta" onClick={snapshot}>
          Download snapshot (PNG)
        </button>
        <button className="cta secondary" onClick={share}>
          {copied ? 'Link copied!' : 'Copy share link'}
        </button>
        <label className="toggle">
          <input
            type="checkbox"
            checked={config.showFps}
            onChange={(e) => config.setShowFps(e.target.checked)}
          />
          Show live FPS meter (top-right of the stage)
        </label>
      </section>

      <section>
        <h2>Try your own GLB</h2>
        <div className="glb-box">
          <p style={{ margin: '0 0 4px', fontSize: 13, color: '#c9c9cf' }}>
            Loads with the real Draco + KTX2 pipeline. The chair returns
            when you clear it.
          </p>
          <input
            type="file"
            accept=".glb"
            aria-label="Choose a GLB file"
            onChange={(e) => loadGlbFile(e.target.files?.[0])}
          />
          <input
            type="text"
            placeholder="…or paste a GLB URL"
            value={glbText}
            onChange={(e) => setGlbText(e.target.value)}
          />
          <div className="row">
            <button
              className="opt"
              disabled={!glbText.trim()}
              onClick={() => config.setGlb(glbText.trim())}
            >
              Load URL
            </button>
            {config.glbUrl && (
              <button className="opt" onClick={config.clearGlb}>
                Back to the chair
              </button>
            )}
          </div>
          {config.glbError && (
            <p className="error" style={{ marginTop: 10 }}>
              Could not load that model: {config.glbError}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
