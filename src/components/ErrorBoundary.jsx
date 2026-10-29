import { Component } from 'react'

/**
 * Catches WebGL / scene crashes (including a failed GLB load) so the
 * page never goes white: the fallback explains what happened and
 * offers a way back. GLB load errors are also reported to the store
 * (see GlbErrorBoundary below) so the panel can show the message.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unknown error' }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="stage-fallback">
        <strong>3D view could not start.</strong>
        <span>
          {this.props.fallbackText ??
            'Your device or browser may not support WebGL, or a model failed to load.'}
        </span>
        <span style={{ fontSize: 12, color: '#7a7a84' }}>{this.state.message}</span>
        <button onClick={() => window.location.reload()}>Reload the page</button>
      </div>
    )
  }
}
