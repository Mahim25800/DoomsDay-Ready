import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [status, setStatus] = useState('Checking the API and database…');

  useEffect(() => {
    const controller = new AbortController();

    async function checkConnection() {
      try {
        const response = await fetch('/api/health', { signal: controller.signal });
        if (!response.ok) throw new Error('Health check failed');
        const health = await response.json();
        setStatus(health.status === 'ok' && health.database === 'sqlite'
          ? 'API and SQLite connected.'
          : 'Unexpected response from the API.');
      } catch {
        if (!controller.signal.aborted) setStatus('Could not reach the API or database.');
      }
    }

    void checkConnection();
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Doomsday Ready</h1>
      <p role="status">{status}</p>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
