FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir pip-tools
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Dummy values only for build-time collectstatic; real vars come from Railway at runtime
ENV DATABASE_URL=sqlite:///db.sqlite3 SECRET_KEY=build-only-key
RUN python manage.py collectstatic --noinput
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2"]
