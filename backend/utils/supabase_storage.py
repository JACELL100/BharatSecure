"""
Supabase Storage Utility for handling file uploads
"""
import os
import uuid
from typing import Optional, BinaryIO
from django.conf import settings
from supabase import create_client, Client
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile


class SupabaseStorage:
    """Handle file uploads to Supabase Storage"""
    
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        )
    
    def upload_file(
        self, 
        file, 
        bucket_name: str, 
        folder: str = "",
        filename: Optional[str] = None
    ) -> str:
        """
        Upload a file to Supabase Storage
        
        Args:
            file: Django uploaded file object or file path
            bucket_name: Name of the Supabase storage bucket
            folder: Optional folder path within the bucket
            filename: Optional custom filename (will generate UUID if not provided)
        
        Returns:
            Public URL of the uploaded file
        """
        # Generate unique filename if not provided
        if filename is None:
            ext = self._get_file_extension(file)
            filename = f"{uuid.uuid4()}{ext}"
        
        # Construct the full path
        file_path = f"{folder}/{filename}" if folder else filename
        
        # Read file content
        if isinstance(file, (InMemoryUploadedFile, TemporaryUploadedFile)):
            file.seek(0)
            file_content = file.read()
            content_type = file.content_type
        elif isinstance(file, str):
            # File path provided
            with open(file, 'rb') as f:
                file_content = f.read()
            content_type = self._guess_content_type(file)
        else:
            # File-like object
            file.seek(0)
            file_content = file.read()
            content_type = 'application/octet-stream'
        
        # Upload to Supabase
        try:
            response = self.supabase.storage.from_(bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)
            return public_url
            
        except Exception as e:
            # If file exists, try updating instead
            if "already exists" in str(e).lower():
                response = self.supabase.storage.from_(bucket_name).update(
                    path=file_path,
                    file=file_content,
                    file_options={"content-type": content_type}
                )
                public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)
                return public_url
            raise e
    
    def delete_file(self, bucket_name: str, file_path: str) -> bool:
        """
        Delete a file from Supabase Storage
        
        Args:
            bucket_name: Name of the Supabase storage bucket
            file_path: Path to the file within the bucket
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.supabase.storage.from_(bucket_name).remove([file_path])
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    def get_public_url(self, bucket_name: str, file_path: str) -> str:
        """
        Get the public URL for a file
        
        Args:
            bucket_name: Name of the Supabase storage bucket
            file_path: Path to the file within the bucket
        
        Returns:
            Public URL of the file
        """
        return self.supabase.storage.from_(bucket_name).get_public_url(file_path)
    
    def _get_file_extension(self, file) -> str:
        """Extract file extension from uploaded file"""
        if isinstance(file, (InMemoryUploadedFile, TemporaryUploadedFile)):
            name = file.name
        elif isinstance(file, str):
            name = file
        else:
            name = getattr(file, 'name', '')
        
        if '.' in name:
            return '.' + name.rsplit('.', 1)[1].lower()
        return ''
    
    def _guess_content_type(self, filename: str) -> str:
        """Guess content type from filename"""
        ext = filename.lower().split('.')[-1] if '.' in filename else ''
        
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'mkv': 'video/x-matroska',
            'webm': 'video/webm',
            'pdf': 'application/pdf',
        }
        
        return content_types.get(ext, 'application/octet-stream')


# Singleton instance
_storage_instance = None

def get_storage() -> SupabaseStorage:
    """Get or create SupabaseStorage singleton instance"""
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = SupabaseStorage()
    return _storage_instance
