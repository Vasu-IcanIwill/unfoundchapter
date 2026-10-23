import ErrorBoundary from './components/ErrorBoundary.jsx';

/** Every page is rendered inside an error boundary; pages are separate HTML entries (see vite.config.js). */
export default function App({ page: Page }) {
  return (
    <ErrorBoundary>
      <Page />
    </ErrorBoundary>
  );
}
