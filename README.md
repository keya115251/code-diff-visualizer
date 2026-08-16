# Code Diff Visualizer

A full-stack tool that compares two code snippets, shows a color-coded line-by-line diff, and uses a locally-run LLM (via Ollama) to explain what changed and why. Built as a DevOps assignment to demonstrate a complete CI/CD pipeline with Jenkins and Docker.

## Features

- Paste two code snippets and get an instant line-level diff (added / removed / unchanged)
- AI-generated plain-English explanation of the change, powered by a local Ollama model — no external API calls, no API keys
- History of past comparisons, saved to SQLite and browsable from the UI
- Fully containerized: frontend, backend, and Ollama each run in their own Docker container, orchestrated with Docker Compose
- Automated CI/CD pipeline via Jenkins: install → test → build → containerize → deploy, triggered on every push

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend   │─────▶│   Backend   │─────▶│   Ollama    │
│ React + Vite │ /api │  Express.js │ HTTP │ (local LLM) │
│  (nginx)     │◀─────│  + SQLite   │◀─────│             │
└─────────────┘      └─────────────┘      └─────────────┘
```

- **Frontend** — React (Vite), built as static assets and served by nginx, which also proxies `/api` calls to the backend
- **Backend** — Node.js/Express, computes the diff (`diff` library), persists comparisons to SQLite, and calls the local Ollama API for the explanation
- **Ollama** — runs a small code-tuned model (`qwen2.5-coder:1.5b`) locally, no cloud API cost or key required

## Tech Stack

| Layer          | Choice                          |
|----------------|----------------------------------|
| Frontend       | React, Vite, plain CSS           |
| Backend        | Node.js, Express                 |
| Database       | SQLite (`better-sqlite3`)        |
| AI             | Ollama (local LLM inference)     |
| Containerization | Docker, Docker Compose         |
| CI/CD          | Jenkins (pipeline as code)       |
| Testing        | Jest (backend), Vitest (frontend)|

## Running Locally

**Prerequisites:** Docker Desktop installed and running.

```bash
docker-compose up -d --build
```

On first run, pull the Ollama model (only needed once — it persists in a Docker volume):

```bash
docker exec diff-visualizer-ollama ollama pull qwen2.5-coder:1.5b
```

Then open:
- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend health check: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Running Tests

```bash
# Backend
cd backend
npm install
npm test

# Frontend
cd frontend
npm install
npm test
```

## CI/CD Pipeline

The `Jenkinsfile` at the repo root defines a pipeline that runs automatically on every push to `main`:

1. **Checkout** — pull the latest code from GitHub
2. **Backend: Install & Test** — install dependencies, run the Jest test suite
3. **Frontend: Install & Test** — install dependencies, run the Vitest suite
4. **Frontend: Build** — production build via Vite
5. **Docker: Build Images** — build backend and frontend images
6. **Deploy** — bring the stack up with `docker-compose`

## Project Structure

```
code-diff-visualizer/
├── backend/            # Express API, diff engine, Ollama client, SQLite layer
├── frontend/           # React app (diff UI, history panel)
├── docker-compose.yml  # Orchestrates backend + frontend + Ollama
├── Jenkinsfile         # CI/CD pipeline definition
└── pull-ollama-model.sh
```
