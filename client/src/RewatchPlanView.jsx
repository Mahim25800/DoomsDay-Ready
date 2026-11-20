import { useEffect, useState } from 'react';
import { request } from './api';

function formatRuntime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function PlanResult({ plan }) {
  if (plan.movies.length === 0) {
    return <p className="plan-empty" role="status">No movies to watch first.</p>;
  }

  return (
    <section className="plan-results" aria-labelledby="watch-order-heading">
      <div className="plan-summary">
        <div className="plan-totals" role="status">
          <strong>{plan.watchedCount} of {plan.movies.length} watched</strong>
          <span>{formatRuntime(plan.remainingRuntimeMinutes)} remaining</span>
        </div>
        <progress aria-label="Rewatch progress" value={plan.watchedCount} max={plan.movies.length} />
      </div>
      <h2 id="watch-order-heading">Watch order</h2>
      <ol className="rewatch-list">
        {plan.movies.map(movie => (
          <li key={movie.id}>
            <div className="rewatch-row">
              <div>
                <strong className="rewatch-title">{movie.title}</strong>
                <p className="movie-meta">{movie.releaseYear} / {movie.runtimeMinutes} min</p>
              </div>
              <span className={movie.watched ? 'rewatch-watched' : 'muted'}>
                {movie.watched ? <><span aria-hidden="true">✓ </span>Watched</> : 'To watch'}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RewatchPlanView() {
  const [movies, setMovies] = useState(null);
  const [libraryError, setLibraryError] = useState('');
  const [libraryAttempt, setLibraryAttempt] = useState(0);
  const [targetId, setTargetId] = useState('');
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState('');
  const [planAttempt, setPlanAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    request('/movies', { signal: controller.signal }).then(movies => {
      if (!controller.signal.aborted) setMovies(movies);
    }).catch(() => {
      if (!controller.signal.aborted) setLibraryError('Could not load the movie library.');
    });
    return () => controller.abort();
  }, [libraryAttempt]);

  useEffect(() => {
    if (!targetId) return;
    const controller = new AbortController();
    request(`/movies/${targetId}/rewatch-order`, { signal: controller.signal }).then(result => {
      if (!controller.signal.aborted) setPlan(result);
    }).catch(error => {
      if (!controller.signal.aborted) setPlanError(error.message);
    });
    return () => controller.abort();
  }, [targetId, planAttempt]);

  return (
    <main className="page-width movies-page">
      <div className="page-heading">
        <h1>Rewatch Plan</h1>
        <p>See what to watch before your selected movie.</p>
      </div>
      <div className="rewatch-content">
        {libraryError && (
          <div>
            <p className="error" role="alert">{libraryError}</p>
            <button type="button" onClick={() => { setLibraryError(''); setLibraryAttempt(attempt => attempt + 1); }}>Try again</button>
          </div>
        )}
        {!movies && !libraryError && <p role="status">Loading movies…</p>}
        {movies?.length === 0 && <p>Add a movie in the <a href="#movies">movie library</a> to build a plan.</p>}
        {movies?.length > 0 && (
          <div className="rewatch-target">
            <label htmlFor="rewatch-target">Target movie</label>
            <select id="rewatch-target" value={targetId} onChange={event => {
              setPlan(null);
              setPlanError('');
              setTargetId(event.target.value);
            }}>
              <option value="">Choose a movie</option>
              {movies.map(movie => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
            </select>
          </div>
        )}
        {targetId && !plan && !planError && <p className="plan-empty" role="status">Loading rewatch plan…</p>}
        {planError && (
          <div className="plan-empty">
            <p className="error" role="alert">{planError}</p>
            <button type="button" onClick={() => { setPlanError(''); setPlanAttempt(attempt => attempt + 1); }}>Try again</button>
          </div>
        )}
        {plan && <PlanResult plan={plan} />}
      </div>
    </main>
  );
}
