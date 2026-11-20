import type { MovieInput } from './movie-input';

type Movie = MovieInput & { id: number };

export function createsPrerequisiteCycle(
  movieId: number,
  proposedIds: number[],
  prerequisitesOf: (id: number) => number[],
): boolean {
  const pending = [...proposedIds];
  const visited = new Set<number>();

  // A proposed link forms a cycle if following it leads back to the movie.
  for (let id = pending.pop(); id !== undefined; id = pending.pop()) {
    if (id === movieId) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const prerequisiteId of prerequisitesOf(id)) pending.push(prerequisiteId);
  }

  return false;
}

export function buildRewatchPlan(target: Movie, moviesById: ReadonlyMap<number, Movie>) {
  const order: Movie[] = [];
  const visited = new Set<number>();
  const pending = [{ movie: target, ready: false }];

  for (let step = pending.pop(); step; step = pending.pop()) {
    const { movie, ready } = step;
    if (ready) {
      order.push(movie);
      continue;
    }
    if (visited.has(movie.id)) continue;
    visited.add(movie.id);

    // Revisit the movie after the stack has processed all its prerequisites.
    pending.push({ movie, ready: true });
    for (const id of movie.prerequisiteIds) {
      const prerequisite = moviesById.get(id);
      if (prerequisite) pending.push({ movie: prerequisite, ready: false });
    }
  }

  order.pop(); // The selected movie is last and belongs outside the plan.
  let watchedCount = 0;
  let remainingRuntimeMinutes = 0;
  for (const movie of order) {
    if (movie.watched) watchedCount++;
    else remainingRuntimeMinutes += movie.runtimeMinutes;
  }
  return { movies: order, watchedCount, remainingRuntimeMinutes };
}
