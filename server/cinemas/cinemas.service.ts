import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

type CinemaRow = { id: number; name: string; bundleSizes: string };

@Injectable()
export class CinemasService {
  constructor(private readonly database: DatabaseService) {}

  list() {
    const rows = this.database.connection.prepare(`
      SELECT id, name,
        (SELECT json_group_array(size ORDER BY size)
         FROM cinema_bundle_sizes WHERE cinema_id = cinemas.id) AS bundleSizes
      FROM cinemas ORDER BY id
    `).all() as CinemaRow[];
    return rows.map(row => ({ ...row, bundleSizes: JSON.parse(row.bundleSizes) as number[] }));
  }

  create(name: string, bundleSizes: number[]) {
    const db = this.database.connection;
    const sizes = [...bundleSizes].sort((a, b) => a - b);
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = db.prepare('INSERT INTO cinemas (name) VALUES (?) ON CONFLICT (name) DO NOTHING').run(name);
      if (!result.changes) throw new ConflictException('A cinema with that name already exists.');

      const id = Number(result.lastInsertRowid);
      const insertSize = db.prepare('INSERT INTO cinema_bundle_sizes (cinema_id, size) VALUES (?, ?)');
      for (const size of sizes) insertSize.run(id, size);

      db.exec('COMMIT');
      return { id, name, bundleSizes: sizes };
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}
