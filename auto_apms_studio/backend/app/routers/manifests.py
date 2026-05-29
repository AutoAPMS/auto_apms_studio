from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class ManifestIdentity(BaseModel):
    identity: str
    package: str
    metadata_id: str


class ManifestIdentityList(BaseModel):
    manifests: list[ManifestIdentity]


@router.get("/manifests/", tags=["manifests"], response_model=ManifestIdentityList)
async def root() -> ManifestIdentityList:
    try:
        from auto_apms_behavior_tree_core.resources import (
            get_node_manifest_resource_identities,
        )
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="AutoAPMS modules not available.",
        )

    identities = get_node_manifest_resource_identities()
    if not identities:
        raise HTTPException(
            status_code=500,
            detail="No node manifest identities found. Check the ROS 2 environment.",
        )

    return ManifestIdentityList(
        manifests=[
            ManifestIdentity(
                identity=str(i),
                package=str(i.package_name),
                metadata_id=str(i.metadata_id),
            )
            for i in identities
        ]
    )
