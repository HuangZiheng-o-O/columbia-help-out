Below is a concise setup guide for MySQL, backend, and frontend.

# Setup Guide (MySQL + Backend + Frontend)

## Prerequisites
- Node.js 18+ and npm
- MySQL 8+
- (Optional) Vite env file for frontend API base: `VITE_API_BASE`

## 1) MySQL Setup
1. Start MySQL server.
2. Create database:

- Create if not exists:
  ```bash
  mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS columbia_help_out CHARACTER SET utf8mb4;"
  ```

- Drop then create fresh:
  ```bash
  mysql -u root -p -e "DROP DATABASE IF EXISTS columbia_help_out; CREATE DATABASE columbia_help_out CHARACTER SET utf8mb4;"
  ```

Use one of them before importing `backend/taskall.sql` and `backend/dataall.sql`.

3. Import schema:
   ```bash
   cd /Users/huangziheng/WebstormProjects/columbia-help-out
   mysql -u root -p columbia_help_out < backend/taskall.sql
   ```
4. Import seed data:
   ```bash
   mysql -u root -p columbia_help_out < backend/dataall.sql
   ```
5. Verify tables:
   ```bash
   mysql -u root -p -e "USE columbia_help_out; SHOW TABLES;"
   ```

## 2) Backend (Express + MySQL)
Path: `/Users/huangziheng/WebstormProjects/columbia-help-out/backend`

1. Install deps (already done if node_modules exists):
   ```bash
   npm install
   ```
2. Env (via shell vars) — defaults are shown:
    - `PORT=4000`
    - `DB_HOST=127.0.0.1`
    - `DB_USER=root`
    - `DB_PASS=`
    - `DB_NAME=columbia_help_out`
3. Run dev server:
   ```bash
   cd /Users/huangziheng/WebstormProjects/columbia-help-out/backend
   PORT=4000 DB_HOST=127.0.0.1 DB_USER=root DB_PASS= DB_NAME=columbia_help_out npm run dev
   ```
4. Health check:
   ```
   GET http://localhost:4000/health
   ```
5. Task APIs (examples):
    - List: `GET /tasks?scope=published&ownerUid=mock-user-1`
    - Claimed: `GET /tasks?scope=claimed&claimedByUid=mock-user-1`
    - Detail: `GET /tasks/:id`
    - Create: `POST /tasks` (JSON body per taskTypes)
    - Update status: `POST /tasks/:id/updateStatus`

## 3) Frontend (React/Vite)
Path: `/Users/huangziheng/WebstormProjects/columbia-help-out`

1. Install deps:
   ```bash
   npm install
   ```
2. (Optional) Set API base if not using default:
    - Create `.env` at project root:
      ```
      VITE_API_BASE=http://localhost:4000
      ```
      Otherwise it falls back to `http://localhost:4000`.
3. Run dev server:
   ```bash
    cd /Users/huangziheng/WebstormProjects/columbia-help-out
   npm run dev
   ```
4. Open the printed Vite URL (commonly http://localhost:5173). The frontend now fetches all data from the backend (no mocks).

## 4) Common Checks & Tips
- If port 4000 is busy: change `PORT` when running backend, and set `VITE_API_BASE` accordingly.
- Re-seed DB anytime:
  ```bash
  mysql -u root -p columbia_help_out < backend/taskall.sql
  mysql -u root -p columbia_help_out < backend/dataall.sql
  ```
- CORS is enabled in dev (backend uses `cors` with `origin: '*'`).

## 5) Current Demo Users
- mock-user-1..8 (mixed verified/unverified). Tasks cover open/claimed/completed/cancelled across multiple publishers and claimers for realistic UI states.
- 