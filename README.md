# Doomsday Ready

A full-stack app for planning an MCU rewatch and getting a cinema group-booking quote.

## Run locally

Use Node.js 24 and npm. From the project root, run:

```sh
npm ci
npm run seed
npm run dev
```

Open `http://127.0.0.1:5173` to manage your movie library. Open **Rewatch Plan** and select **Avengers: Doomsday** to see its watch order, progress, and remaining time. Vite proxies `/api` to Nest on port 3000. The API creates the local database at `data/doomsday.sqlite`.

Run `npm run build` to compile the API and build the React client.

`npm run seed` adds the eight movies and their prerequisite links from the assessment, plus four sample cinemas with the example bundle sizes. Rerunning it skips existing movies and cinemas by name and preserves their edits. The assessment supplies the dependency links and bundle sizes. The release year and runtime for Avengers: Doomsday are demo values.

## Movies API

Use `POST /api/movies` to create a movie, `GET /api/movies` to list movies, and `PATCH /api/movies/:id` to update fields. A create request requires `title`, `releaseYear`, and `runtimeMinutes`.

```json
{
  "title": "Iron Man",
  "releaseYear": 2008,
  "runtimeMinutes": 126,
  "watched": false,
  "prerequisiteIds": []
}
```

New movies default to unwatched with no prerequisites. A PATCH body can include only the fields to change. Sending `prerequisiteIds` replaces the full list, and sending an empty array clears it.

A direct or indirect prerequisite cycle returns HTTP 409 with code `CIRCULAR_DEPENDENCY`. The transaction rolls back the entire write.

`GET /api/movies/:id/rewatch-order` returns `movies` in prerequisite order, plus `watchedCount` and `remainingRuntimeMinutes`. Each prerequisite appears once. The selected movie is excluded from the list and both totals.

## AI assistance

Codex helped plan the project, scaffold the app, and implement and verify the SQLite schema, sample seed, movie endpoints, prerequisite cycle detection, rewatch ordering, and Movies and Rewatch Plan views.
