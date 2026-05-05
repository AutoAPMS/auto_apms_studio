from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import nodes, health, mission, upload, status, manifests, executors
from .adapters.ros_node import init_ros_node, shutdown_ros_node


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_ros_node()
    yield
    shutdown_ros_node()


app = FastAPI(
    title="AutoAPMS Studio API",
    version="0.2.0",
    description="AutoAPMS Studio Backend API Endpoints. For general use you want to use the node_modules API endpoint. To check the API status, use the health endpoint.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health")
app.include_router(status.router, prefix="/ws/v1")
app.include_router(mission.router, prefix="/ws/v1")
app.include_router(nodes.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(manifests.router, prefix="/api/v1")
app.include_router(executors.router, prefix="/api/v1")
