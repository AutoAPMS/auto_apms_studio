# AutoAPMS Studio - Backend

## About
The AutoAPMS Studio Backend provides API endpoints for node model retrieval from AutoAPMS and BehaviorTree.CPP native node_models. 

## Index

- [Architecture](#architecture)
- [Usage](#usage)
- [Development](#development)

## Architecture

```

backend/
├── app
│   ├── main.py         # FastAPI application entry point
│   ├── models          
│   │   └── nodes.py    # Pydantic model definitions
│   └── routers
│       ├── nodes.py     # /api/v1/node_models/ API router
│       └── health.py    # /health API router
│
└── scripts
    └── list_nodes.py   # Script to list available node models

```

## Usage

The backend is built using FastAPI. It exposes endpoints to retrieve node models.
You can either run the backend server through FastAPI or uvicorn.
### Installation
1. Clone the repository. We recommend using SSH:
   ```bash
   git clone git@git-ce.rwth-aachen.de:tuda-fsr/uas/ros-pkgs/auto_apms_studio.git
   ```
2. Install the required dependencies using pip:
   ```bash
   cd web/backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -e .
   ```
3. Source the ROS 2 workspace:
   ```bash
   source ~/<path_to_your_directory>/install/setup.bash
   ```
### Commands
You can now start the backend server using FastAPI or uvicorn:
- Using FastAPI:
    ```bash
    fastapi run
    ```
- Using uvicorn: (note: for this to run you need to be in the web/ directory.)
    ```bash
    uvicorn backend.app.main:app --reload
    ```

### API Endpoints
You can access the API documentation from: http://localhost:8000/docs

- `/api/v1/node_modules/` - Returns a list of node models.
- `/health` - Health check endpoint.