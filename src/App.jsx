import Scene from './components/Scene.jsx'
import ConfigPanel from './components/ConfigPanel.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { formatPrice, priceOf } from './data/config.js'
import { useConfig } from './store/useConfig.js'

export default function App() {
  const config = useConfig()
  const { total } = priceOf(config)

  return (
    <div className="app">
      <header className="header">
        <h1>
          ATLAS <span>3D</span>
        </h1>
        <p>Lounge chair configurator — demo product, no real orders.</p>
      </header>
      <div className="main">
        <div className="stage">
          <ErrorBoundary fallbackText="The 3D view could not start on this device. Try a browser with WebGL enabled.">
            <Scene />
          </ErrorBoundary>
          <div className="price-chip">
            <div className="label">Your chair</div>
            <div className="value">{formatPrice(total)}</div>
            <div className="sub">Live price — updates with every choice</div>
          </div>
          {config.showFps && (
            <div className="fps-badge">
              <span id="fps-value">— FPS</span>
            </div>
          )}
        </div>
        <ConfigPanel />
      </div>
      <footer className="footer">
        Atlas 3D Configurator · React + React Three Fiber + Draco / KTX2
        pipeline · Demo product with demo prices — measure FPS on your own
        device with the meter in the panel.
      </footer>
    </div>
  )
}
