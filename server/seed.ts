import { DatabaseService } from './database.service';

const movies = [
  { title: 'Iron Man', year: 2008, runtime: 126, prerequisites: [] },
  { title: 'Captain America: The First Avenger', year: 2011, runtime: 124, prerequisites: [] },
  { title: 'The Avengers', year: 2012, runtime: 143, prerequisites: ['Iron Man', 'Captain America: The First Avenger'] },
  { title: 'Captain America: Civil War', year: 2016, runtime: 147, prerequisites: ['The Avengers'] },
  { title: 'Thor: Ragnarok', year: 2017, runtime: 130, prerequisites: [] },
  { title: 'Avengers: Infinity War', year: 2018, runtime: 149, prerequisites: ['Captain America: Civil War', 'Thor: Ragnarok'] },
  { title: 'Avengers: Endgame', year: 2019, runtime: 181, prerequisites: ['Avengers: Infinity War'] },
  { title: 'Avengers: Doomsday', year: 2026, runtime: 150, prerequisites: ['Avengers: Endgame'] },
];

const cinemas = [
  { name: 'Sample Cinema A', sizes: [1, 3, 4] },
  { name: 'Sample Cinema B', sizes: [2, 5] },
  { name: 'Sample Cinema C', sizes: [6, 9, 20] },
  { name: 'Sample Cinema D', sizes: [4, 6] },
];

function seed() {
  const database = new DatabaseService();
  const db = database.connection;

  try {
    const insertMovie = db.prepare(`
      INSERT INTO movies (title, release_year, runtime_minutes)
      VALUES (?, ?, ?) ON CONFLICT (title) DO NOTHING
    `);
    const insertPrerequisite = db.prepare(`
      INSERT INTO movie_prerequisites (movie_id, prerequisite_id)
      VALUES (?, (SELECT id FROM movies WHERE title = ?))
    `);
    const insertCinema = db.prepare(`
      INSERT INTO cinemas (name) VALUES (?) ON CONFLICT (name) DO NOTHING
    `);
    const insertSize = db.prepare('INSERT INTO cinema_bundle_sizes (cinema_id, size) VALUES (?, ?)');

    db.exec('BEGIN IMMEDIATE');
    try {
      for (const movie of movies) {
        const result = insertMovie.run(movie.title, movie.year, movie.runtime);
        if (!result.changes) continue;

        for (const title of movie.prerequisites) {
          insertPrerequisite.run(result.lastInsertRowid, title);
        }
      }

      for (const cinema of cinemas) {
        const result = insertCinema.run(cinema.name);
        if (!result.changes) continue;

        for (const size of cinema.sizes) {
          insertSize.run(result.lastInsertRowid, size);
        }
      }

      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    console.log('Sample movies and cinemas are ready.');
  } finally {
    database.onModuleDestroy();
  }
}

seed();
