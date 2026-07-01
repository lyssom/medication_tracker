import os

# 数据库配置
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_URL = os.path.join(BASE_DIR, 'data', 'medguardian.db')

# JWT 配置
JWT_SECRET_KEY = 'e68d62f4d3e09056c5476ebd271a56f264fda39354965d6aac38709021b58c53'
JWT_ACCESS_TOKEN_EXPIRES = 30*24 * 60 * 60  # 24小时
# JWT_ACCESS_TOKEN_EXPIRES = 5

# 文件上传配置
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# API 配置
API_VERSION = 'v1'
