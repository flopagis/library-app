# The Library

A small website for lending your books and games to friends. Friends browse the catalog and request an item by typing their name; you (the admin) approve or reject requests and mark things returned from an admin dashboard.

## How it works

- Every item is **In Library**, **Requested** (someone asked for it), or **Rented** (it's out, with a due date).
- Anyone can browse and request an available item — no account needed, just a name.
- Only you can log into `/admin` to approve/reject requests, mark items returned, and add/edit/delete items. Login is a single shared password (bcrypt-hashed, stored in an env var) — there's no per-friend login system.

## Local setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a free Postgres database at [neon.tech](https://neon.tech) (sign up, create a project, copy the connection string — it looks like `postgresql://user:password@host/dbname?sslmode=require`).
3. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — the Neon connection string from step 2
   - `SESSION_SECRET` — any long random string
   - `ADMIN_PASSWORD_HASH` — generate this by running:
     ```
     npm run hash-password -- "your-chosen-password"
     ```
     and pasting the printed hash into `.env`
4. Create the database tables:
   ```
   npx prisma migrate dev --name init
   ```
5. Start the app:
   ```
   npm run dev
   ```
   Visit http://localhost:3000. Log in at http://localhost:3000/admin/login with the password you chose in step 3, and add your first few items from the dashboard.

## Deploying for free (Render + Neon)

You already have the Neon database from local setup — the deployed app will use the same one (or create a second Neon project for production if you want them separate).

1. Push this project to a GitHub repo.
2. Go to [render.com](https://render.com), sign up, and click **New > Web Service**, connecting your GitHub repo.
3. Configure the service:
   - **Build command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start command:** `npm start`
4. Add the same three environment variables from your `.env` (`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH`) in Render's dashboard under **Environment**.
5. Deploy. Render will give you a public URL (e.g. `https://your-app.onrender.com`) — that's what you share with friends.

Note: on Render's free tier, the app "sleeps" after 15 minutes of no traffic and takes a few seconds to wake back up on the next visit. That's expected and fine for a friends-only site.

## Adding items from photos

If you send photos of your shelves in chat, titles can be read off the images and turned into a list to add via the admin dashboard — cover images themselves aren't hosted automatically in this version (the `Cover image URL` field expects a link, e.g. from Open Library or a game database, or you can leave it blank for a placeholder icon).
