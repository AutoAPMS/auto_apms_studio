# Project structure

AutoAPMS Studio includes both a backend and a frontend. It is developed modularly, with clear separation between the FastAPI backend, React frontend, and documentation.
The structure of the project allows quick changes to the backend and frontend independently.

## The project structure is as follows:
```
auto_apms_studio/
├── launch/                  # ROS 2 launch file
├── auto_apms_studio/        # Backend ROS2 / Python Package
│   └── backend/             # FastAPI backend app and adapters
│       ├── app/             # FastAPI app, routers, adapters, models
│       └── pyproject.toml
├── web/                     # Frontend (Vite + React)
│   ├── src/                 # React source (components, services, store)
│   └── package.json
├── docs/                    # Documentation (user-guide + dev-guide)
└── README.md
```

### Where to look when developing

#### General Structure:

- Backend API and routers: `auto_apms_studio/backend/app/routers/`: node model retrieval, upload, status, mission
- Backend adapters: `auto_apms_studio/backend/app/adapters/`: converts AutoAPMS & native node models to the internal model
- Backend models: `auto_apms_studio/backend/app/models/`: Pydantic request/response models
- Frontend: `web/src/`: editor UI, converters, services calling the backend, backup node models
- Docs: `docs/`: VitePress Docs pages for user and developer documentation

#### Test Files:

- Backend tests: `auto_apms_studio/backend/tests/`
- Frontend tests: `web/src/tests/`

If something is unclear, see the [Architecture](architecture.md) page for how the pieces interact.

<div class="custom-block tip" style="padding: 8px 12px;">
  <p style="margin: 0;">Tip: When working on both frontend and backend, run the backend on port <code>8000</code> and the frontend dev server on <code>5173</code> (defaults) for a smooth development experience.</p>
</div>


