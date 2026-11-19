export const schema = `
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    release_year INTEGER NOT NULL CHECK (release_year > 0),
    runtime_minutes INTEGER NOT NULL CHECK (runtime_minutes BETWEEN 1 AND 300),
    watched INTEGER NOT NULL DEFAULT 0 CHECK (watched IN (0, 1))
  ) STRICT;

  CREATE TABLE IF NOT EXISTS movie_prerequisites (
    movie_id INTEGER NOT NULL REFERENCES movies(id),
    prerequisite_id INTEGER NOT NULL REFERENCES movies(id),
    PRIMARY KEY (movie_id, prerequisite_id),
    CHECK (movie_id <> prerequisite_id)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS cinemas (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  ) STRICT;

  CREATE TABLE IF NOT EXISTS cinema_bundle_sizes (
    cinema_id INTEGER NOT NULL REFERENCES cinemas(id),
    size INTEGER NOT NULL CHECK (size BETWEEN 1 AND 500),
    PRIMARY KEY (cinema_id, size)
  ) STRICT;
`;
