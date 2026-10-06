"""
Configuration settings for AgriVisionAI
"""

import os

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Upload configuration
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Model configuration
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'saved_models', 'best_model.keras')
CLASS_NAMES_PATH = os.path.join(BASE_DIR, 'model', 'saved_models', 'class_names.json')

# Image processing
IMAGE_SIZE = (224, 224)

# API configuration
API_PREFIX = '/api'

# Browser origins allowed to call the API. Set CORS_ORIGINS in production to
# the exact frontend origin (for example, https://your-app.vercel.app).
_default_cors_origins = [
    'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5173',
]
_configured_cors_origins = os.environ.get('CORS_ORIGINS')
CORS_ORIGINS = (
    [origin.strip().rstrip('/') for origin in _configured_cors_origins.split(',') if origin.strip()]
    if _configured_cors_origins
    else _default_cors_origins
)
