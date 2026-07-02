# 药伴 Landing 部署

## TL;DR

- **生产 URL**：`https://lyssom.tech/medication/`
- **后端 API 路径**：`https://lyssom.tech/medication/api/*` (保持原状)
- **APK 下载**：`https://lyssom.tech/medication/downloads/medication_tracker_rn_v0.1.0.apk` (Flask catch-all serve，不再依赖独立的 :5000)
- **改动范围**：
  - **新增**：`medication_tracker_bk/static/yaoban/`（landing 静态文件）
  - **修改**：`medication_tracker_bk/app.py`（添加 landing 路由，不动 nginx）
  - **不动**：`/etc/nginx/*`（不影响 `metadao.lyssom.tech` 等其他业务）
- **冲突检查**：
  - `/medication/api/*` → 走 Flask 蓝图（已注册的 `/api/auth`, `/api/meds`, `/api/care`, `/api/plan`, `/api/latest`, `/api/health`）
  - `/medication/<其它>` → 走 landing 静态服务
  - `/uploads/*` → 走原 `uploaded_file`（即使你那边 git 里这个路由有点历史 bug，**和本次部署无关**）

## 架构示意

```
Internet
  ↓
lyssom.tech (nginx, 不动)
  ├─ /                     → metadao / 其他业务
  ├─ /metadao              → metadao.lyssom.tech 业务
  └─ /medication/*         → proxy_pass → gunicorn 127.0.0.1:5001
                                ↓
                          Flask app (app.py)
                            ├─ /api/*            → 蓝图（auth/meds/care/plan/version/health）
                            ├─ /uploads/*        → uploaded_file
                            └─ /medication/*     → landing (static/yaoban/)  ★ 本次新增
```

## 部署步骤

### 一次性：服务端预装

```bash
# 在 prod server (114.215.177.111) 上
cd /opt/medication_tracker_bk
mkdir -p static/yaoban
```

### 每次发布：从本地推送

```bash
# 本地 (10.67.0.124) → 推 landing + 重启服务
cd /root/medication_tracker

# 1. 推 landing 静态文件 (rsync 增量)
rsync -avz --delete \
  medication_tracker_bk/static/yaoban/ \
  root@lyssom.tech:/opt/medication_tracker_bk/static/yaoban/

# 2. 推 app.py (如果 landing 路由有改动)
scp medication_tracker_bk/app.py root@lyssom.tech:/opt/medication_tracker_bk/app.py

# 3. 重启 gunicorn (服务名以你那边为准)
ssh root@lyssom.tech 'systemctl restart medication_tracker.service'
# 或:
ssh root@lyssom.tech 'supervisorctl restart medication_tracker'

# 4. 验证
curl -sI https://lyssom.tech/medication/ | head -1
curl -sI https://lyssom.tech/medication/api/health | head -1
```

### 自动化（可选）：deploy.sh

把 `scripts/deploy-landing.sh` 加到项目根，单命令发布（无 SSH 自动化的手动版见下）：

```bash
#!/usr/bin/env bash
set -euo pipefail
REMOTE="${REMOTE:-root@114.215.177.111}"
APP_DIR="${APP_DIR:-/opt/medication_tracker_bk}"

cd "$(dirname "$0")"

echo "→ rsync static/yaoban/"
rsync -avz --delete \
  medication_tracker_bk/static/yaoban/ \
  "$REMOTE:$APP_DIR/static/yaoban/"

echo "→ scp app.py"
scp medication_tracker_bk/app.py "$REMOTE:$APP_DIR/app.py"

echo "→ restart service"
ssh "$REMOTE" "systemctl restart medication_tracker.service"

echo "→ verify"
sleep 2
curl -sI "https://lyssom.tech/medication/" | head -1
curl -sI "https://lyssom.tech/medication/api/health" | head -1
```

## 文件清单

```
medication_tracker_bk/
├── app.py                            # [改] 加了 /medication/* 静态路由
└── static/
    └── yaoban/                       # [新] landing 静态
        ├── index.html                # 21 KB · 药伴 v3 (Brand Bold)
        └── assets/
            ├── icon.png              # 6.5 KB
            └── qr.png                # 0.8 KB
```

## 验证清单

| URL | 期望 | 用途 |
|-----|------|------|
| `https://lyssom.tech/medication/` | 200 · 21 KB HTML | landing 首页 |
| `https://lyssom.tech/medication/assets/icon.png` | 200 · 6.5 KB | 站点 favicon |
| `https://lyssom.tech/medication/assets/qr.png` | 200 · 0.8 KB | 扫码下载 |
| `https://lyssom.tech/medication/api/health` | 404 或 200* | 不应被 landing 拦截 |
| `https://lyssom.tech/medication/api/auth/login` | 401/400 | 不应被 landing 拦截 |
| `https://lyssom.tech/medication/x` | 200 · 21 KB (SPA 回落) | 任何未匹配路径 |

`*` `/medication/api/health` 取决于 nginx 是 `proxy_pass http://127.0.0.1:5001/;`（剥前缀 → 200）还是 `proxy_pass http://127.0.0.1:5001;`（保留前缀 → 404 + 我们的 landing 防御性 abort）。**两种配置都安全**。

## 风险点

1. **nginx 配置前缀**：如果你的 nginx `proxy_pass` 用了**带斜杠**版本（`http://127.0.0.1:5001/;`），Flask 收到的是 `/api/health`，landing 路由完全不参与，安全。如果用了**不带斜杠**版本，Flask 收到 `/medication/api/health`，landing 路由的防御性 `if p.startswith('api/'): abort(404)` 兜底，也安全。两种情况都覆盖。

2. **缓存**：CDN/浏览器可能缓存旧 HTML。如果用了 nginx proxy_cache，第一次部署后强制刷一次 `https://lyssom.tech/medication/?v=1` 或在 HTML 头部加 `<meta http-equiv="Cache-Control" content="no-store">`。

3. **gunicorn workers**：gunicorn 进程缓存了路由表。修改 app.py 后必须 `systemctl restart` 而非 `reload`（reload 可能不重新注册新路由）。

## 回滚

```bash
# 1. 恢复 app.py
ssh root@lyssom.tech "cd /opt/medication_tracker_bk && git checkout app.py"
ssh root@lyssom.tech "systemctl restart medication_tracker.service"

# 2. 删 landing
ssh root@lyssom.tech "rm -rf /opt/medication_tracker_bk/static/yaoban"

# 3. 验证
curl -sI https://lyssom.tech/medication/ | head -1
# 应为 502/404 (nginx 转发但 gunicorn 无此路由)
```

## 设计稿

设计探索版（含 v1/v2 对比）保留在 `landing/` 目录：
- `landing/v3-brand.html` = 生产版（药伴 · Brand Bold）
- `landing/v1-editorial.html` / `v2-bento.html` = 探索版（备选）
- `landing/index.html` = 三版并排 picker

发布时只需 `landing/v3-brand.html` 的内容（已 copy 到 `medication_tracker_bk/static/yaoban/index.html`）。
