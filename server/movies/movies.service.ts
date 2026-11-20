import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import type { MovieInput } from './movie-input';
import { buildRewatchPlan, createsPrerequisiteCycle } from './movie-planning';

type MovieRow = Omit<MovieInput, 'watched' | 'prerequisiteIds'> & {
  id: number;
  watched: number;
  prerequisiteIds: string;
};

const selectMovies = `
  SELECT id, title, release_year AS releaseYear, runtime_minutes AS runtimeMinutes, watched,
    (SELECT json_group_array(prerequisite_id ORDER BY prerequisite_id)
     FROM movie_prerequisites WHERE movie_id = movies.id) AS prerequisiteIds
  FROM movies
`;

function toMovie(row: MovieRow) {
  return {
    ...row,
    watched: row.watched === 1,
    prerequisiteIds: JSON.parse(row.prerequisiteIds) as number[],
  };
}

@Injectable()
export class MoviesService {
  constructor(private readonly database: DatabaseService) {}

  list() {
    const rows = this.database.connection.prepare(`${selectMovies} ORDER BY id`).all() as MovieRow[];
    return rows.map(toMovie);
  }

  rewatchOrder(targetId: number) {
    const movies = new Map(this.list().map(movie => [movie.id, movie]));
    const target = movies.get(targetId);
    if (!target) throw new NotFoundException('Movie not found.');
    return buildRewatchPlan(target, movies);
  }

  create(movie: MovieInput) {
    return this.transaction(() => {
      const db = this.database.connection;
      const result = db.prepare(`
        INSERT INTO movies (title, release_year, runtime_minutes, watched)
        VALUES (?, ?, ?, ?) ON CONFLICT (title) DO NOTHING
      `).run(movie.title, movie.releaseYear, movie.runtimeMinutes, Number(movie.watched));
      if (!result.changes) throw new ConflictException('A movie with that title already exists.');

      const id = Number(result.lastInsertRowid);
      this.replacePrerequisites(id, movie.prerequisiteIds);
      return this.getMovie(id);
    });
  }

  update(id: number, changes: Partial<MovieInput>) {
    return this.transaction(() => {
      const db = this.database.connection;
      const movie = { ...this.getMovie(id), ...changes };
      const duplicate = db.prepare('SELECT id FROM movies WHERE title = ? AND id <> ?').get(movie.title, id);
      if (duplicate) throw new ConflictException('A movie with that title already exists.');

      db.prepare(`
        UPDATE movies SET title = ?, release_year = ?, runtime_minutes = ?, watched = ? WHERE id = ?
      `).run(movie.title, movie.releaseYear, movie.runtimeMinutes, Number(movie.watched), id);
      if (changes.prerequisiteIds !== undefined) this.replacePrerequisites(id, changes.prerequisiteIds);
      return this.getMovie(id);
    });
  }

  private getMovie(id: number) {
    const row = this.database.connection.prepare(`${selectMovies} WHERE id = ?`).get(id) as MovieRow | undefined;
    if (!row) throw new NotFoundException('Movie not found.');
    return toMovie(row);
  }

  private replacePrerequisites(id: number, prerequisiteIds: number[]) {
    const db = this.database.connection;
    const findPrerequisites = db.prepare(
      'SELECT prerequisite_id AS id FROM movie_prerequisites WHERE movie_id = ?',
    );
    const prerequisitesOf = (movieId: number) =>
      findPrerequisites.all(movieId).map(row => Number(row.id));

    if (createsPrerequisiteCycle(id, prerequisiteIds, prerequisitesOf)) {
      throw new ConflictException({
        statusCode: 409,
        code: 'CIRCULAR_DEPENDENCY',
        message: 'A movie cannot require itself directly or indirectly.',
      });
    }

    const findMovie = db.prepare('SELECT id FROM movies WHERE id = ?');
    for (const prerequisiteId of prerequisiteIds) {
      if (!findMovie.get(prerequisiteId)) {
        throw new BadRequestException(`Prerequisite movie ${prerequisiteId} does not exist.`);
      }
    }

    db.prepare('DELETE FROM movie_prerequisites WHERE movie_id = ?').run(id);
    const insert = db.prepare('INSERT INTO movie_prerequisites (movie_id, prerequisite_id) VALUES (?, ?)');
    for (const prerequisiteId of prerequisiteIds) insert.run(id, prerequisiteId);
  }

  private transaction<T>(work: () => T): T {
    const db = this.database.connection;
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = work();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}
