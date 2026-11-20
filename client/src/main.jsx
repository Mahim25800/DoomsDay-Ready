import { createRoot } from 'react-dom/client';
import { MoviesView } from './MoviesView';
import './styles.css';

function App() {
  return (
    <>
      <header className="masthead">
        <div className="page-width">Doomsday Ready</div>
      </header>
      <MoviesView />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
