import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly connection: DatabaseSync;

  constructor() {
    const dataDirectory = resolve('data');
    mkdirSync(dataDirectory, { recursive: true });
    this.connection = new DatabaseSync(join(dataDirectory, 'doomsday.sqlite'));
  }

  onModuleDestroy() {
    this.connection.close();
  }
}
