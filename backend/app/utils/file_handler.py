import os
import aiofiles
from fastapi import UploadFile, HTTPException
from pathlib import Path
from datetime import datetime

class FileHandler:
    # Base directory for uploads (outside project root)
    UPLOAD_DIR = Path("../uploads")

    @staticmethod
    async def upload_file(file: UploadFile, case_id: str) -> dict:
        """
        Upload a file to the uploads directory under a case-specific folder.
        Returns metadata about the uploaded file.
        """
        # Ensure the upload directory exists
        case_dir = FileHandler.UPLOAD_DIR / case_id
        case_dir.mkdir(parents=True, exist_ok=True)

        # Generate a unique filename with timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        file_extension = Path(file.filename).suffix
        unique_filename = f"{timestamp}_{Path(file.filename).stem}{file_extension}"
        file_path = case_dir / unique_filename

        # Save the file
        try:
            async with aiofiles.open(file_path, "wb") as buffer:
                content = await file.read()
                await buffer.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

        # Determine file type
        file_type = "unknown"
        if file_extension.lower() in [".jpg", ".jpeg", ".png", ".gif"]:
            file_type = "photo"
        elif file_extension.lower() in [".mp4", ".avi", ".mov"]:
            file_type = "video"
        elif file_extension.lower() == ".pdf":
            file_type = "document"

        # Return metadata for the Evidence model
        return {
            "type": file_type,
            "url": f"/uploads/{case_id}/{unique_filename}",
            "description": None,
            "date_captured": datetime.utcnow()
        }

    @staticmethod
    def delete_file(file_url: str) -> bool:
        """
        Delete a file from the uploads directory.
        Returns True if deletion is successful, False otherwise.
        """
        # Extract the actual file path (remove leading /uploads/)
        file_path = FileHandler.UPLOAD_DIR / file_url.lstrip("/uploads/")
        try:
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception:
            return False

    @staticmethod
    def check_file_exists(file_url: str) -> bool:
        """
        Check if a file exists in the uploads directory.
        """
        file_path = FileHandler.UPLOAD_DIR / file_url.lstrip("/uploads/")
        return file_path.exists()

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