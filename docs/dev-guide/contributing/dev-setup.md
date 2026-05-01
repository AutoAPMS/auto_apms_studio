# Developer setup

Get started with development! This page explains how to get a working local development environment for backend and frontend work.

## Prerequisites

- Python 3.12+
- Node.js + npm
- ROS 2 and AutoAPMS

## Backend (FastAPI)

::: tip
You must source a ROS 2 workspace with AutoAPMS and install AutoAPMS Studio into that workspace.
:::

1. Create and activate a virtual environment and install the package in editable mode:

```bash
cd auto_apms_studio/backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

2. Install additional dev tools:

```bash
pip install pytest mypy ruff uvicorn
```

3. Run the backend with uvicorn:

```bash
uvicorn app.main:app --reload --port 8000
```

4. Open `http://localhost:8000/docs` to view the automatic API docs.

For more information on FastAPI and ROS 2, visit the [ROS 2 docs](https://docs.ros.org/en/jazzy/index.html) and the [FastAPI docs](https://fastapi.tiangolo.com/).

## Frontend (React)

1. Install dependencies and start the dev server:

```bash
cd web
npm install
npm run dev
```

2. Open the dev URL (default: `http://localhost:5173`).

## Running tests

- Backend tests: from `auto_apms_studio/backend` run:

```bash
pytest -q
```

- Frontend tests: from `web/` run:
```bash
npm run test
```

<div class="custom-block tip" style="padding: 8px 12px;">
  <p style="margin: 0;">Tip: Run backend on port <code>8000</code> and frontend dev server on <code>5173</code> while developing both sides.</p>
</div>


