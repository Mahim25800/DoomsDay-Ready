import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookingView } from './BookingView';
import { MoviesView } from './MoviesView';
import { RewatchPlanView } from './RewatchPlanView';
import './styles.css';

const views = [
  { hash: '#movies', label: 'Movies', Component: MoviesView },
  { hash: '#rewatch', label: 'Rewatch Plan', Component: RewatchPlanView },
  { hash: '#booking', label: 'Booking', Component: BookingView },
];

function App() {
  const [hash, setHash] = useState(window.location.hash);
  const activeView = views.find(view => view.hash === hash) ?? views[0];
  const View = activeView.Component;

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
            {views.map(view => (
              <a key={view.hash} href={view.hash} aria-current={view === activeView ? 'page' : undefined}>
                {view.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <View />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
