# FACREC — Deployment / Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ with `pip`
- MongoDB (local install, or a free Atlas cluster)
- A webcam, for the recognition feature specifically (everything else
  runs fine without one)

## 1. Clone / unzip and install dependencies

```bash
# from the project root (the folder containing face_recognition.py)
pip install -r requirements.txt

cd server
npm install
cd ../client
npm install
```

## 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://127.0.0.1:27017/facrec
JWT_SECRET=<replace with a long random string>
PORT=5000
PYTHON_PATH=python        # or an absolute path if "python" isn't on PATH
```

For MongoDB Atlas, `MONGODB_URI` looks like
`mongodb+srv://<user>:<password>@<cluster>.mongodb.net/facrec`.

## 3. Seed the database

The app has no users until you seed it — this is a required step, not
optional cleanup.

```bash
cd server
npm run seed
```

This creates (idempotently — safe to re-run):
- 1 admin (`admin@facrec.edu`)
- 2 faculty accounts, each assigned to subjects
- 5 subjects across semesters 3–4
- 10 students enrolled in the semester-3 subjects
- default password for every seeded login: `Facrec@123`

Console output prints the exact login credentials after seeding.

## 4. Run the backend

```bash
cd server
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```

Expect:
```
✅ MongoDB Connected
🚀 FACREC Enterprise Backend Started
🌐 http://localhost:5000
```

## 5. Run the frontend

```bash
cd client
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Log
in with one of the seeded accounts.

## 6. Register a student's face (optional, for recognition testing)

The seed data already links roll numbers `21`–`30` to student records,
and `face_dataset/21.npy` and `face_dataset/MITHESH.npy` ship with the
repo as sample datasets. To register a new one:

```bash
# project root
python register_student.py
```

Enter the exact Roll No of a student that already exists in the app
(create them via Students page first if needed), let it capture 30
samples. See `VISION_INTEGRATION.md` for details.

## 7. Production build (frontend)

```bash
cd client
npm run build
```

Outputs to `client/dist/` — serve statically (nginx, `serve`, etc.) or
point Express to serve it if you add that wiring. This repo runs
frontend and backend as two separate dev servers; combining them into
one deployable process is a config addition, not a code change.

## Common issues

| Symptom | Cause | Fix |
|---|---|---|
| `The uri parameter to openUri() must be a string` | `.env` missing or wrong working directory | Make sure you're inside `server/` and `.env` exists there (copy from `.env.example`) |
| `npm error ENOENT ... package.json` | Ran `npm install`/`npm run dev` from the project root instead of `server/` or `client/` | `cd server` or `cd client` first — there is no root-level `package.json` by design (two independent apps) |
| Login fails for every account | Database was never seeded | `cd server && npm run seed` |
| Recognition returns "No active attendance session" | No session has `status: ACTIVE` | Start a session from the Sessions page first |
| `haarcascade` / face detection errors | Running `register_student.py` or the recognition flow from the wrong working directory | Run Python commands from the project root, not from inside `server/` or `vision/` |
