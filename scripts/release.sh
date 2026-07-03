#!/usr/bin/env bash
# release.sh — 完整 release 流程
#
# 流程:
#   1. expo prebuild --platform android (重生 mipmap + 引用新 icon)
#   2. 手动 bump versionCode 1 → $1 (prebuild 会重置回 1, 必须 prebuild 后改)
#   3. gradle assembleRelease (5 min 全量, 1 min 增量)
#   4. 验证 APK + deploy 到 prod
#   5. 更新 medication_tracker_bk/uploads/latest.json
#   6. 重启 flask
#
# 用法: ./scripts/release.sh <versionCode> <versionName>
# 例:   ./scripts/release.sh 501 0.5.1

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "用法: $0 <versionCode> <versionName>"
  echo "例:  $0 501 0.5.1"
  exit 1
fi

VC=$1
VN=$2
PROJ="/root/medication_tracker/medication_tracker_rn"
APK_REL="$PROJ/android/app/build/outputs/apk/release/app-release.apk"
KEY="/root/metadao/.deploy-keys/id_ed25519"
REMOTE="root@114.215.177.111"
REMOTE_DIR="/opt/medication_tracker_bk/static/yaoban"
REMOTE_UPLOADS="/opt/medication_tracker_bk/uploads"

# 1. prebuild (重生 android/, 引用最新 assets/images/*.png)
echo "==> 1. expo prebuild"
cd "$PROJ"
npx expo prebuild --platform android --no-install 2>&1 | tail -3

# 2. bump versionCode (prebuild 后必须, 否则回 1)
echo "==> 2. bump versionCode → $VC, versionName → $VN"
sed -i "s/versionCode [0-9]\+/versionCode $VC/" "$PROJ/android/app/build.gradle"
sed -i "s/versionName \"[^\"]*\"/versionName \"$VN\"/" "$PROJ/android/app/build.gradle"
grep -E "versionCode|versionName" "$PROJ/android/app/build.gradle" | head -2

# 3. build
echo "==> 3. gradle assembleRelease"
cd "$PROJ/android"
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=/opt/gradle/gradle-8.13/bin:/usr/lib/jvm/java-17-openjdk/bin:/opt/android-sdk/platform-tools:$PATH
export JAVA_TOOL_OPTIONS="-Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=7890 -Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=7890"

# 后台跑 (免 shell exit 杀)
LOG=/tmp/release-$(date +%Y%m%d-%H%M%S).log
setsid /opt/gradle/gradle-8.13/bin/gradle :app:assembleRelease \
  --no-daemon --max-workers=1 -x lint -PreactNativeArchitectures=arm64-v8a \
  > "$LOG" 2>&1 < /dev/null &
disown
GPID=$!
echo "build PID: $GPID, log: $LOG"

# 4. poll
for i in $(seq 1 30); do
  sleep 30
  if ! kill -0 $GPID 2>/dev/null; then
    if grep -q "BUILD SUCCESSFUL" "$LOG"; then
      break
    else
      echo "✗ build FAILED"
      tail -20 "$LOG"
      exit 1
    fi
  fi
  echo "  ...still building ($(grep -c '^> Task' $LOG 2>/dev/null || echo 0) tasks done)"
done

# 5. 验证
AAPT=/opt/android-sdk/build-tools/35.0.0/aapt
APKSIGNER=/opt/android-sdk/build-tools/35.0.0/apksigner
echo "==> 5. verify APK"
$AAPT dump badging "$APK_REL" 2>&1 | grep "package:"
$APKSIGNER verify "$APK_REL" 2>&1 | head -3
ls -la "$APK_REL"

# 6. 上传 + latest.json
APK_NAME="medication_tracker_rn_v${VN}.apk"
LOCAL_COPY="/root/medication_tracker/medication_tracker.apk"
cp "$APK_REL" "$LOCAL_COPY"

echo "==> 6. scp APK → prod"
scp -i "$KEY" -o StrictHostKeyChecking=accept-new "$APK_REL" "$REMOTE:$REMOTE_DIR/$APK_NAME" 2>&1 | tail -2

echo "==> 7. 更新 latest.json"
cat > /root/medication_tracker/medication_tracker_bk/uploads/latest.json << JEOF
{
  "version": "${VN}",
  "build": ${VC},
  "released_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "mandatory": false,
  "download_url": "https://lyssom.tech/medication/downloads/${APK_NAME}",
  "notes": "C7 + 药丸 icon. versionCode ${VC} (递增). 全 release 流程封装在 scripts/release.sh"
}
JEOF
scp -i "$KEY" -o StrictHostKeyChecking=accept-new /root/medication_tracker/medication_tracker_bk/uploads/latest.json "$REMOTE:$REMOTE_UPLOADS/latest.json" 2>&1 | tail -1

echo "==> 8. restart flask"
ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$REMOTE" "systemctl restart medication_tracker.service" 2>&1 | tail -1

echo "==> 9. verify"
curl -s https://lyssom.tech/medication/api/latest | head -c 400
echo ""
echo ""
echo "✓ release v${VN} (build ${VC}) done"
