from fastapi import APIRouter
from pydantic import BaseModel
from ..adapters.ros_node import get_node
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

DEFAULT_EXECUTOR = "/tree_executor/start"
EXECUTOR_ACTION_TYPE = "auto_apms_interfaces/action/StartTreeExecutor"


class ExecutorList(BaseModel):
    executors: list[str]
    default: str


@router.get("/", tags=["executors"], response_model=ExecutorList)
async def root() -> ExecutorList:
    ros_node = get_node()
    names = []

    try:
        all_actions = ros_node.handle.get_action_names_and_types()
        names = [name for name, types in all_actions if EXECUTOR_ACTION_TYPE in types]
    except Exception as e:
        logger.warning(f"Could not discover action servers: {e}")

    if DEFAULT_EXECUTOR not in names:
        names.insert(0, DEFAULT_EXECUTOR)

    return ExecutorList(executors=names, default=DEFAULT_EXECUTOR)
