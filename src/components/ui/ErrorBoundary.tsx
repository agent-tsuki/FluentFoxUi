import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IS_DEV } from '@/lib/config'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Top-level error boundary. Wrap the app or subtrees that might throw.
 * Shows a friendly recovery UI instead of a blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // TODO: send to error monitoring (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center space-y-6 animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-error">error</span>
          </div>

          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold font-display text-ink tracking-tighter">
              Something went wrong
            </h2>
            <p className="text-ink-muted text-sm leading-relaxed">
              An unexpected error occurred. You can try refreshing the page or going back home.
            </p>
            {IS_DEV && this.state.error && (
              <pre className="mt-4 p-4 bg-surface-sunken rounded-sm text-xs text-error text-left overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-sm font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Try Again
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              className="px-6 py-2.5 border border-line rounded-sm text-ink-muted font-bold text-sm hover:text-ink transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
