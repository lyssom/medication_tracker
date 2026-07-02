#!/usr/bin/env bash
# deploy-landing.sh — 推送药伴 landing 到 prod server
# 用法:
#   ./scripts/deploy-landing.sh                                 # 全默认（root@114.215.177.111）
#   REMOTE=root@other ./scripts/deploy-landing.sh              # 改远端
#   ./scripts/deploy-landing.sh --dry-run                       # 只打日志，不推
#
# 关键约束:
#   - 不动 nginx（lysso.tech:/etc/nginx/conf.d/metadao.conf 里 /medication/ 已 proxy 到 127.0.0.1:5001）
#   - Flask 同进程同时服务 API + 静态站 + APK 下载
#   - metadao.lyssom.tech / 根域其他业务零触碰
#
# 流程:
#   1. 备份 prod app.py (留 .bak.YYYYMMDD-HHMMSS)
#   2. 确保 prod 上 /opt/medication_tracker_bk/static/yaoban/ 存在
#   3. rsync static/yaoban/ -> prod (--delete 清掉旧文件)
#   4. scp app.py -> prod
#   5. systemctl restart medication_tracker (gunicorn refresh routes)
#   6. 烟测 4 个端点

set -euo pipefail

# ---- config (env-overridable) ----
REMOTE="${REMOTE:-root@114.215.177.111}"
KEY="${KEY:-/root/metadao/.deploy-keys/id_ed25519}"
APP_DIR="${APP_DIR:-/opt/medication_tracker_bk}"
SERVICE="${SERVICE:-medication_tracker.service}"
PROD_URL="${PROD_URL:-https://lyssom.tech}"

DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) echo "unknown arg: $arg"; exit 2 ;;
  esac
done

# ---- paths ----
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$ROOT_DIR/medication_tracker_bk"

SSH_BASE=(-i "$KEY" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -o ServerAliveInterval=30)
SSH="ssh ${SSH_BASE[@]}"
SCP="scp ${SSH_BASE[@]}"
RSYNC="rsync -avz --delete ${SSH_BASE[@]/#/-e ssh}"

# ---- preflight ----
[[ -d "$SRC_DIR/static/yaoban" ]] || { echo "✗ $SRC_DIR/static/yaoban 不存在"; exit 1; }
[[ -f "$SRC_DIR/app.py" ]]      || { echo "✗ $SRC_DIR/app.py 不存在"; exit 1; }
[[ -f "$KEY" ]]                 || { echo "✗ SSH key 不存在: $KEY"; exit 1; }

APK_SIZE=$(stat -c %s "$SRC_DIR/static/yaoban/downloads/"*.apk 2>/dev/null | head -1 || echo "0")
INDEX_SIZE=$(stat -c %s "$SRC_DIR/static/yaoban/index.html" 2>/dev/null || echo "0")

echo "==> bundle: index.html=${INDEX_SIZE}B  apk=${APK_SIZE}B"
echo "==> target: $REMOTE:$APP_DIR"
echo

if $DRY_RUN; then
  echo "(dry-run: 跳过实际推送)"
  exit 0
fi

# ---- 1. backup prod app.py ----
echo "==> 1. backup $REMOTE:$APP_DIR/app.py"
$SSH "$REMOTE" "cd $APP_DIR && cp -p app.py app.py.bak.\$(date +%Y%m%d-%H%M%S) && ls -1 app.py*"

# ---- 2. ensure target dir exists ----
echo
echo "==> 2. mkdir -p static/yaoban/"
$SSH "$REMOTE" "mkdir -p $APP_DIR/static/yaoban"

# ---- 3. rsync ----
echo
echo "==> 3. rsync static/yaoban/  ->  $REMOTE:$APP_DIR/static/yaoban/"
$RSYNC "$SRC_DIR/static/yaoban/" "$REMOTE:$APP_DIR/static/yaoban/"

# ---- 4. push app.py ----
echo
echo "==> 4. scp app.py  ->  $REMOTE:$APP_DIR/app.py"
$SCP "$SRC_DIR/app.py" "$REMOTE:$APP_DIR/app.py"

# ---- 5. restart ----
echo
echo "==> 5. systemctl restart $SERVICE"
$SSH "$REMOTE" "systemctl restart $SERVICE && sleep 3 && systemctl is-active $SERVICE"

# ---- 6. smoke test ----
echo
echo "==> 6. smoke test"
L1=$(curl -sI "$PROD_URL/medication/" | head -1 | tr -d '\r')
L2=$(curl -sI "$PROD_URL/medication/assets/qr.png" | head -1 | tr -d '\r')
L3=$(curl -sI "$PROD_URL/medication/downloads/medication_tracker_rn_v0.1.0.apk" | head -1 | tr -d '\r')
L4=$(curl -s "$PROD_URL/medication/api/health" | head -c 80)
L5=$(curl -sI "$PROD_URL/medication/任意路径" | head -1 | tr -d '\r')
printf "  %-50s %s\n" "/medication/" "$L1"
printf "  %-50s %s\n" "/medication/assets/qr.png" "$L2"
printf "  %-50s %s\n" "/medication/downloads/...apk" "$L3"
printf "  %-50s %s\n" "/medication/api/health (API)" "$L4"
printf "  %-50s %s\n" "/medication/<任意不存在>" "$L5 (SPA fallback)"

echo
echo "✓ 部署完成"
echo "  公开 URL: $PROD_URL/medication/"
echo "  APK 下载: $PROD_URL/medication/downloads/medication_tracker_rn_v0.1.0.apk"
