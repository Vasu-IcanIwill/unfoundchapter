import { Component } from 'react';

/** Keeps the page usable if an interactive component fails: the static content stays, the widget is replaced. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (typeof console !== 'undefined') console.error('[Unfound Chapter]', error, info && info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return (
        <div role="alert" style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px', textAlign: 'center', color: '#1B2B4A', fontFamily: "'Montserrat', 'Montserrat Fallback', 'Montserrat Fallback Android', 'Montserrat Fallback Linux', system-ui, sans-serif" }}>
          <p style={{ fontFamily: "'Brygada 1918', 'Brygada 1918 Fallback', 'Brygada 1918 Fallback Android', 'Brygada 1918 Fallback Linux', Georgia, serif", fontSize: 28, margin: '0 0 12px' }}>This page could not be shown.</p>
          <p style={{ fontSize: 14, lineHeight: 2, color: '#454B50', margin: '0 0 20px' }}>Please refresh the page. If it keeps happening, return to the first page.</p>
          <a href="/" style={{ color: '#1B2B4A', borderBottom: '1px solid #B89B65' }}>Return to the first page</a>
        </div>
      );
    }
    return this.props.children;
  }
}
