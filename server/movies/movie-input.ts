import { BadRequestException } from '@nestjs/common';

export interface MovieInput {
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  watched: boolean;
  prerequisiteIds: number[];
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function parseMovieInput(body: unknown): Partial<MovieInput> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Send a movie as a JSON object.');
  }

  const changes: Partial<MovieInput> = {};
  for (const [field, value] of Object.entries(body)) {
    switch (field) {
      case 'title':
        if (typeof value !== 'string' || !value.trim()) {
          throw new BadRequestException('Title must be a non-empty string.');
        }
        changes.title = value.trim();
        break;
      case 'releaseYear':
        if (!isPositiveInteger(value)) {
          throw new BadRequestException('Release year must be a positive integer.');
        }
        changes.releaseYear = value;
        break;
      case 'runtimeMinutes':
        if (!isPositiveInteger(value) || value > 300) {
          throw new BadRequestException('Runtime must be an integer from 1 to 300 minutes.');
        }
        changes.runtimeMinutes = value;
        break;
      case 'watched':
        if (typeof value !== 'boolean') {
          throw new BadRequestException('Watched must be true or false.');
        }
        changes.watched = value;
        break;
      case 'prerequisiteIds':
        if (!Array.isArray(value) || !value.every(isPositiveInteger)) {
          throw new BadRequestException('Prerequisite IDs must be an array of positive integers.');
        }
        if (new Set(value).size !== value.length) {
          throw new BadRequestException('Prerequisite IDs must be distinct.');
        }
        changes.prerequisiteIds = value;
        break;
      default:
        throw new BadRequestException(`Unknown movie field "${field}".`);
    }
  }
  return changes;
}
