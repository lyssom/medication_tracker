import os

# 数据库配置
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_URL = os.path.join(BASE_DIR, 'data', 'medguardian.db')

# JWT 配置 — 生产用 env var；本地开发用 fallback (warning)
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-only-secret-change-in-prod'
JWT_ACCESS_TOKEN_EXPIRES = 30*24 * 60 * 60  # 30 天

# 文件上传配置
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# API 配置
API_VERSION = 'v1'

# CORS 允许的源 (跨域请求白名单)
CORS_ORIGINS = [
    'https://lyssom.tech',
    'https://metadao.lyssom.tech',
    # 开发便利：
    'http://localhost:8081',
    'http://10.67.0.14:8081',
    'http://127.0.0.1:8081',
]
