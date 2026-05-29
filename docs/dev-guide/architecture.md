# Architecture

Learn about the AutoAPMS Studio architecture and how it works. 

## Components

AutoAPMS Studio consists of three main parts:

- the **Frontend**, built with React and Vite, the frontend provides the user interface for editing Behavior Trees, importing/exporting Behavior Trees, and deploying Behavior Trees. It communicates with the backend via REST and WebSocket APIs.
- the **Backend**, built with Python and FastAPI, the backend exposes REST and WebSocket endpoints for the frontend to interact with. It also contains adapters that load node models from AutoAPMS manifests and native BehaviorTree.CPP nodes, merging them into a unified format for the frontend.
- the **ROS 2** / **AutoAPMS** runtime. This allows the backend to bridge to ROS 2 and interact with AutoAPMS actions. 

For the best experience, users should run the backend and frontend together. Development should not rely on the standalone frontend only.

## Process flow

1. When the frontend loads, it requests available node models from the backend via `GET /api/v1/node_modules/`.
2. The backend then gathers node models from AutoAPMS (manifests) and native BehaviorTree.CPP registry, then returns them to the frontend as a JSON.
3. Frontend imports these, renders them, and in case of a failure, displays an error message and falls back to built-in defaults.
4. For mission execution, frontend opens a WebSocket to `/ws/v1/mission`. The backend then forwards the request and handles the WebSocket connection.
5. Status updates (executor availability, ping) are provided by `/ws/v1/status` at regular intervals.

## Usage options

- **Recommended**: install AutoAPMS Studio as a ROS 2 package in a sourced workspace. This enables full integration with AutoAPMS and action servers. You can install the backend standalone and run it alongside the frontend.
- Standalone (offline mode): run only the web app (cached node models or built-in defaults). Useful for quick edits and demos but lacks live ROS 2 integration.
