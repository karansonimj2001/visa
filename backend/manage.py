import os
import sys
import dj_database_url

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    # For migrations against Supabase, use direct connection
    if 'migrate' in sys.argv or 'makemigrations' in sys.argv:
        direct_url = os.environ.get('SUPABASE_DB_DIRECT_URL')
        if direct_url and not direct_url.startswith('sqlite'):
            os.environ['DATABASE_URL'] = direct_url
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
