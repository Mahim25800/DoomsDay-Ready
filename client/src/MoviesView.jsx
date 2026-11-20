import { useEffect, useRef, useState } from 'react';
import { request } from './api';

function readPrerequisites(form) {
  return form.getAll('prerequisiteIds').map(Number);
}

function PrerequisitePicker({ movies, selected = [] }) {
  return (
    <fieldset className="picker">
      <legend>Movies to watch first</legend>
      {movies.length === 0 && <p className="muted">No other movies in the library.</p>}
      {movies.map(movie => (
        <label className="checkbox-label" key={movie.id}>
          <input
            type="checkbox"
            name="prerequisiteIds"
            value={movie.id}
            defaultChecked={selected.includes(movie.id)}
          />
          {movie.title}
        </label>
      ))}
    </fieldset>
  );
}

function AddMovieForm({ movies, onAdd }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    setError('');
    setNotice('');

    try {
      const movie = await onAdd({
        title: values.get('title'),
        releaseYear: Number(values.get('releaseYear')),
        runtimeMinutes: Number(values.get('runtimeMinutes')),
        prerequisiteIds: readPrerequisites(values),
      });
      form.reset();
      setNotice(`${movie.title} added.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="add-panel" id="add-movie" tabIndex={-1} aria-labelledby="add-movie-heading">
      <h2 id="add-movie-heading">Add a movie</h2>
      <form onSubmit={submit}>
        <fieldset className="form-fields" disabled={pending}>
          <label>
            Title
            <input name="title" required />
          </label>
          <div className="number-fields">
            <label>
              Release year
              <input name="releaseYear" type="number" min="1" required />
            </label>
            <label>
              Runtime (min)
              <input name="runtimeMinutes" type="number" min="1" max="300" required />
            </label>
          </div>
          <details>
            <summary>Prerequisites (optional)</summary>
            <PrerequisitePicker movies={movies} />
          </details>
          <button className="primary" type="submit">{pending ? 'Adding…' : 'Add movie'}</button>
        </fieldset>
        {error && <p className="error" role="alert">{error}</p>}
        {notice && <p className="muted" role="status">{notice}</p>}
      </form>
    </section>
  );
}

function MovieRow({ movie, movies, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const editButton = useRef(null);
  const prerequisites = movie.prerequisiteIds.map(id => movies.find(item => item.id === id)?.title).filter(Boolean);

  function closeEditor() {
    setEditing(false);
    requestAnimationFrame(() => editButton.current?.focus());
  }

  async function save(changes) {
    setPending(true);
    setError('');
    try {
      await onUpdate(movie.id, changes);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setPending(false);
    }
  }

  async function savePrerequisites(event) {
    event.preventDefault();
    const prerequisiteIds = readPrerequisites(new FormData(event.currentTarget));
    if (await save({ prerequisiteIds })) closeEditor();
  }

  return (
    <li className="movie-row">
      <article aria-labelledby={`movie-${movie.id}`}>
        <div className="movie-top">
          <div>
            <h3 id={`movie-${movie.id}`}>{movie.title}</h3>
            <p className="movie-meta">{movie.releaseYear} / {movie.runtimeMinutes} min</p>
          </div>
          <label className="checkbox-label watched">
            <input
              type="checkbox"
              aria-label={`Watched: ${movie.title}`}
              checked={movie.watched}
              disabled={pending}
              onChange={event => void save({ watched: event.target.checked })}
            />
            Watched
          </label>
        </div>
        <p className="prerequisite-summary"><strong>Watch first</strong> {prerequisites.join(', ') || 'None'}</p>
        <button
          ref={editButton}
          type="button"
          className="text-button"
          aria-expanded={editing}
          disabled={pending}
          onClick={() => {
            setError('');
            setEditing(!editing);
          }}
        >
          Edit prerequisites
        </button>
        {editing && (
          <form className="edit-form" onSubmit={savePrerequisites}>
            <fieldset className="form-fields" disabled={pending}>
              <PrerequisitePicker
                movies={movies.filter(item => item.id !== movie.id)}
                selected={movie.prerequisiteIds}
              />
              <div className="form-actions">
                <button className="primary" type="submit">{pending ? 'Saving…' : 'Save prerequisites'}</button>
                <button type="button" onClick={() => { setError(''); closeEditor(); }}>Cancel</button>
              </div>
            </fieldset>
          </form>
        )}
        {error && <p className="error" role="alert">{error}</p>}
      </article>
    </li>
  );
}

export function MoviesView() {
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    request('/movies', { signal: controller.signal }).then(setMovies).catch(() => {
      if (!controller.signal.aborted) setError('Could not load the movie library.');
    });
    return () => controller.abort();
  }, [loadAttempt]);

  async function addMovie(body) {
    const movie = await request('/movies', { method: 'POST', body });
    setMovies(current => [...current, movie]);
    return movie;
  }

  async function updateMovie(id, body) {
    const movie = await request(`/movies/${id}`, { method: 'PATCH', body });
    setMovies(current => current.map(item => item.id === id ? movie : item));
  }

  return (
    <main className="page-width app-page">
      <div className="page-heading">
        <h1>Movies</h1>
        <p>Build your library and choose what to watch first.</p>
        {movies && <a className="jump-link" href="#add-movie">Add a movie</a>}
      </div>
      {error && (
        <div>
          <p className="error" role="alert">{error}</p>
          <button type="button" onClick={() => { setError(''); setLoadAttempt(attempt => attempt + 1); }}>Try again</button>
        </div>
      )}
      {!movies && !error && <p role="status">Loading movies…</p>}
      {movies && (
        <div className="movie-layout">
          <section aria-labelledby="movie-library-heading">
            <div className="library-heading">
              <h2 id="movie-library-heading">Movie library</h2>
              <span className="muted">{movies.length} {movies.length === 1 ? 'movie' : 'movies'}</span>
            </div>
            {movies.length === 0 && <p className="muted">Add your first movie to start the library.</p>}
            <ul className="movie-list">
              {movies.map(movie => (
                <MovieRow key={movie.id} movie={movie} movies={movies} onUpdate={updateMovie} />
              ))}
            </ul>
          </section>
          <AddMovieForm movies={movies} onAdd={addMovie} />
        </div>
      )}
    </main>
  );
}
