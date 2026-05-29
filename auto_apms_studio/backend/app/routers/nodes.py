from typing import Any
from fastapi import APIRouter, HTTPException
from auto_apms_studio.backend.app.models.nodes import NodeModelList
from auto_apms_studio.backend.app.adapters.autoapms import AutoAPMSLoader
from auto_apms_studio.backend.app.adapters.cpp_nodes import NativeTreeLoader

router = APIRouter()


@router.get("/node_modules/", tags=["nodes"], response_model=NodeModelList)
async def root() -> Any:
    nodes = AutoAPMSLoader.get_all_nodes() + NativeTreeLoader.get_all_nodes()
    if not nodes:
        raise HTTPException(
            status_code=500,
            detail="Node model retrieval failed. Please check the ROS 2 environment and ensure AutoAPMS is installed correctly.",
        )
    else:
        return NodeModelList(nodes=nodes)
