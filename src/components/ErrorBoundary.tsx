import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Without this, any render error unmounts the whole tree and users see a blank
// page. Shows a readable message (with the technical detail they can send back).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Quiniela render error:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="empty-state" role="alert" style={{ padding: '2rem 1rem' }}>
        <p style={{ fontWeight: 700 }}>Algo ha fallado al mostrar la quiniela.</p>
        <p>Prueba a recargar. Si sigue igual, envía una captura de este mensaje:</p>
        <p style={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>
          {error.name}: {error.message}
          <br />
          {navigator.userAgent}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    );
  }
}
