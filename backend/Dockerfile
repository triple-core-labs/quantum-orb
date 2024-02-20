# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /backend

# Install dependencies
COPY requirements.txt /backend/
RUN pip install --upgrade pip setuptools
RUN pip install -r requirements.txt

# Copy project
COPY . /backend/

# Expose the port the app runs in
EXPOSE 8000

# Define the command to run the app
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
