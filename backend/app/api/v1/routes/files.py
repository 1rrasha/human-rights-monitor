from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from pathlib import Path
from app.utils.file_handler import FileHandler

router = APIRouter(prefix="/uploads", tags=["Files"])

@router.get("/{path:path}")
async def serve_file(path: str):
    """
    Serve a file from the uploads directory.
    """
    # Construct the full file path
    file_path = FileHandler.UPLOAD_DIR / path

    # Check if the file exists
    if not FileHandler.check_file_exists(f"/uploads/{path}"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    # Serve the file with appropriate content type
    return FileResponse(
        path=file_path,
        media_type=FileHandler.get_content_type(file_path.suffix.lower())
    )

@staticmethod
def get_content_type(file_extension: str) -> str:
    """
    Determine the Content-Type based on file extension.
    """
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".mp4": "video/mp4",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".pdf": "application/pdf"
    }
    return content_types.get(file_extension, "application/octet-stream")