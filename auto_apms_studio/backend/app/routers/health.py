from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/", tags=["health"])
async def root() -> JSONResponse:
    return JSONResponse(content={"status": "healthy"}, status_code=200)
