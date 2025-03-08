FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the Django project files
COPY . .

# Set environment variable
ENV DJANGO_SETTINGS_MODULE=bookhub.settings

# Run migrations (อาจจะเป็นการเตรียมการก่อนให้พร้อม)
RUN python manage.py migrate

# Expose port 8000
EXPOSE 8000

# Run gunicorn as the production server
CMD ["gunicorn", "bookhub.wsgi:application", "--bind", "0.0.0.0:8000"]
