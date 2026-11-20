import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MoviesView } from './MoviesView';
import { RewatchPlanView } from './RewatchPlanView';
import './styles.css';

function App() {
  const [hash, setHash] = useState(window.location.hash);
  const showRewatch = hash === '#rewatch';

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <>
      <header className="masthead">
        <div className="page-width masthead-content">
          <span>Doomsday Ready</span>
          <nav aria-label="Main navigation">
            <a href="#movies" aria-current={showRewatch ? undefined : 'page'}>Movies</a>
            <a href="#rewatch" aria-current={showRewatch ? 'page' : undefined}>Rewatch Plan</a>
          </nav>
        </div>
      </header>
      {showRewatch ? <RewatchPlanView /> : <MoviesView />}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
