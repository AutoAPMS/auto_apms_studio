from fastapi import APIRouter, UploadFile, File, HTTPException
import defusedxml.ElementTree as ElementTree

router = APIRouter()

MAX_PAYLOAD_SIZE = 1024 * 1024 * 1


@router.post("/upload/xml")
async def upload_xml(file: UploadFile = File(...)):
    if not file.filename.endswith(".xml"):
        raise HTTPException(
            status_code=400, detail="Invalid file type, only .xml files are allowed"
        )

    content = await file.read()

    if len(content) > MAX_PAYLOAD_SIZE:
        raise HTTPException(
            status_code=400, detail="XML file is too large, maximum size is 1MB"
        )

    try:
        xml_string = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400, detail="Invalid XML file, unable to decode as UTF-8"
        )

    try:
        ElementTree.fromstring(xml_string)
    except ElementTree.ParseError as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid XML file, unable to parse: {e}"
        )

    return {"xml": xml_string, "filename": file.filename}
