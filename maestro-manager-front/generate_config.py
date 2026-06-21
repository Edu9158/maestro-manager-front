from pathlib import Path
import os

root = Path(__file__).resolve().parent
config_path = root / 'config.js'

api_base_url = os.getenv('API_BASE_URL', 'http://localhost:8000')
products_endpoint = os.getenv('PRODUCTS_ENDPOINT', '/products')

config_path.write_text(
    f"window.__APP_CONFIG__ = window.__APP_CONFIG__ || {{}};\n"
    f"window.__APP_CONFIG__.API_BASE_URL = '{api_base_url}';\n"
    f"window.__APP_CONFIG__.PRODUCTS_ENDPOINT = '{products_endpoint}';\n",
    encoding='utf-8'
)
