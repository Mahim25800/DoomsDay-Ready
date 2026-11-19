# Doomsday Ready

A full-stack app for planning an MCU rewatch and getting a cinema group-booking quote.

## Run locally

Use Node.js 24 and npm. From the project root, run:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. The page checks the Nest API at `/api/health` through the Vite proxy. The API runs on port 3000 and executes a SQLite query for the health check. It creates the local database at `data/doomsday.sqlite`.

Run `npm run build` to compile the API and build the React client.

## AI assistance

Codex helped plan the project and scaffold and verify the NestJS, Vite, and SQLite setup.
