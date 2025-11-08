# Akubata

This repository contains a Node.js + Express backend (in `server/`) for a simple inventory/orders system using Sequelize with MySQL (via `mysql2`).

## Contents

- `server/` - Express API and Sequelize models/controllers/routes
- `client/` - (front-end folder, not covered here)

## Prerequisites

- Node.js 18+ (or a recent LTS) and npm installed
- MySQL (or compatible) server running and accessible
- Git (optional)

## Setup (server)

1. Open a terminal and change to the server folder:

```bash
cd server
```

1. Install dependencies:

```bash
npm install
```

1. Environment variables

Create a `.env` file in `server/` (you can copy `.env.example` if provided). Required variables used by the project:

- `DB_HOST` - database host (e.g. `localhost`)
- `DB_PORT` - database port (e.g. `3306`)
- `DB_NAME` - database name
- `DB_USER` - database username
- `DB_PASS` - database password
- `JWT_SECRET` - secret used to sign JWTs

Example `.env` (example values — do not commit secrets):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=akubata_dev
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=replace_with_a_strong_secret
```

1. Create the database

Using the MySQL client or a GUI, create the database name you set in `DB_NAME`:

```sql
CREATE DATABASE akubata_dev;
```

1. Start the server

The project uses Sequelize and (by default) appears to sync models at runtime. Start the server with:

```bash
npm start
```

This runs the script defined in `server/package.json` (`node server.js`) and should start the API server. Check the console for the listening port (commonly 3000 or as configured in the code).

## Notes about the codebase

- The server uses ESM (`"type": "module"` in `package.json`).
- Sequelize is configured in `server/config/db.js` — it uses `mysql2` library (make sure your MySQL server accepts the connections).
- Models are defined under `server/models/` and controllers under `server/controllers/`.
- Routes are under `server/routes/` and wired in `server/server.js`.

## Common tasks

- Run the server in development:

  - Install deps: `npm install`
  - Start: `npm start`

- Run tests: no test runner configured in `package.json` currently.

## Environment / deployment suggestions

- Use a strong random `JWT_SECRET` in production and keep it secure (env manager or secret store).
- Use a separate production database and set `NODE_ENV=production`.
- Consider adding a process manager (pm2, systemd) for production.
- Add migrations (Sequelize CLI) and tests before deploying to production.

## Troubleshooting

- If the server fails to connect to DB, verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, and that MySQL is running and accepting TCP connections.
- If you see ESM import errors, ensure Node version supports ESM and `package.json` has `"type": "module"` (already present).

## Next steps / recommended improvements

- Add a `.env.example` to document env variables.
- Add database migrations with `sequelize-cli` instead of using `sync` in production.
- Add unit/integration tests and a `test` script.
- Add a small README for the `client/` folder (if there is a front-end).

---

Created to help run and develop the project locally. If you want, I can:

- Add a `.env.example` file with the expected variables
- Add a `Makefile` or npm scripts for `dev`/`migrate`/`seed`
- Detect and document the default server port from `server/server.js`

Tell me which follow-up you'd like next.
