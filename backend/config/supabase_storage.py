import os
from django.core.files.storage import Storage
from supabase import create_client, Client

class SupabaseStorage(Storage):
    def __init__(self):
        self.client: Client = create_client(
            os.environ['SUPABASE_URL'],
            os.environ['SUPABASE_SERVICE_KEY']
        )
        self.bucket = os.environ.get('SUPABASE_STORAGE_BUCKET', 'visa-documents')

    def _sanitize_filename(self, name):
        import re
        parts = [p for p in name.replace('\\', '/').split('/') if p not in ('', '.', '..')]
        clean = [re.sub(r'[^a-zA-Z0-9._-]', '_', p) for p in parts]
        return '/'.join(clean)

    def _save(self, name, content):
        sanitized = self._sanitize_filename(name)
        file_content = content.read() if hasattr(content, 'read') else content
        self.client.storage.from_(self.bucket).upload(
            sanitized, file_content,
            options={'cacheControl': '3600', 'upsert': True}
        )
        return sanitized

    def url(self, name):
        return self.client.storage.from_(self.bucket).get_public_url(name)

    def exists(self, name):
        # Bucket uses upsert=True on upload, so overwriting the same
        # sanitized path is safe. Returning False keeps Django from
        # appending random suffixes to every fresh upload.
        return False

    def size(self, name):
        return 0

    def delete(self, name):
        pass

    def open(self, name, mode='rb'):
        raise NotImplementedError
