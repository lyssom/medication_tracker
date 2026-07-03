# Android Build — Local APK

> 本机构建 release APK 的完整流程。从 0 到 41MB 的 app-release.apk。

## TL;DR

```bash
# 已 build 过一次后增量再 build：
cd /root/medication_tracker/medication_tracker_rn/android
systemd-run --user --unit=medication-build \
  --working-directory=$(pwd) \
  --setenv=ANDROID_HOME=/opt/android-sdk \
  --setenv=JAVA_HOME=/usr/lib/jvm/java-17-openjdk \
  --setenv=PATH=/opt/gradle/gradle-8.13/bin:/usr/lib/jvm/java-17-openjdk/bin:/opt/android-sdk/platform-tools:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin \
  /opt/gradle/gradle-8.13/bin/gradle :app:assembleRelease --no-daemon --max-workers=1 -x lint -PreactNativeArchitectures=arm64-v8a

# APK 在：
ls android/app/build/outputs/apk/release/app-release.apk
```

## 前置：环境一次性安装

| 组件 | 版本 | 安装 |
|---|---|---|
| Java JDK | 17.0.19 (Android Gradle Plugin 8.x) | `pacman -S jdk17-openjdk` |
| Android SDK | platforms;android-36 + build-tools;36.0.0 + ndk;27.1.12297006 + cmake;3.22.1 + platform-tools | 见下 |
| Gradle | 8.13 (本地，wrapper 引用) | 见下 |
| Node | v20+ via nvm | nvm use 20 |

### 1. JDK 17

```bash
sudo pacman -S jdk17-openjdk
sudo archlinux-java set java-17-openjdk
java -version  # openjdk version "17.0.19"
```

### 2. Android SDK（从 Tencent 镜像）

`pacman` 没有 google-android-* 包。手动装：

```bash
mkdir -p /opt/android-sdk/cmdline-tools
cd /opt/android-sdk/cmdline-tools
curl -sL --max-time 120 -o cli.zip "https://mirrors.cloud.tencent.com/AndroidSDK/commandlinetools-linux-11076708_latest.zip"
unzip -q cli.zip && mv cmdline-tools latest

# Accept licenses + install packages
yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses
export ANDROID_HOME=/opt/android-sdk
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager \
  "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" \
  "cmake;3.22.1" "platform-tools"
```

> NDK 27.1.12297006 ~ 1.5GB。装 5-10 分钟（取决于网络）。

### 3. Gradle 8.13（本地，wrapper 引用）

```bash
mkdir -p /opt/gradle
cd /opt/gradle
curl -sL --max-time 120 -o gradle-8.13-bin.zip "https://mirrors.cloud.tencent.com/gradle/gradle-8.13-bin.zip"
unzip -q gradle-8.13-bin.zip
/opt/gradle/gradle-8.13/bin/gradle --version  # Gradle 8.13
```

## 项目内一次性配置

**第一次** build 前要做 3 处改：

### A. `android/build.gradle` 加阿里 maven 镜像 + expo-root-project

```gradle
buildscript {
  repositories {
    maven { url 'https://maven.aliyun.com/repository/public' }
    maven { url 'https://maven.aliyun.com/repository/google' }
    google()
    mavenCentral()
  }
  dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
  }
}

allprojects {
  repositories {
    maven { url 'https://maven.aliyun.com/repository/public' }
    maven { url 'https://maven.aliyun.com/repository/google' }
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
}

apply plugin: "expo-root-project"
apply plugin: "com.facebook.react.rootproject"
```

**为什么：** `expo-root-project` 注入 `ext { ndkVersion, compileSdkVersion, buildToolsVersion }` 让 `:app` 引用 `rootProject.ext.*` 工作。

### B. `android/gradle/wrapper/gradle-wrapper.properties` 用本地 gradle

```properties
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.13-bin.zip
```

### C. `~/.gradle/init.gradle` 设 plugin repos（解决 foojay-resolver 找不到）

```groovy
allprojects {
  repositories {
    maven { url 'https://maven.aliyun.com/repository/public' }
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
}
beforeSettings { settings ->
  settings.pluginManagement {
    repositories {
      maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
      maven { url 'https://maven.aliyun.com/repository/public' }
      maven { url 'https://maven.aliyun.com/repository/google' }
      gradlePluginPortal()
    }
  }
}
```

### D. NativeWind 4 装 reanimated@4.3.0 + worklets@0.8.3（不是最新）

`react-native-css-interop`（NativeWind 依赖）内部动态 require `react-native-reanimated`。
`react-native-reanimated@4.5.0` 强制要 `worklets@0.10.x`，但 worklets 0.10 + NDK 27 编译 C++ 失败。

**唯一稳定组合（2026-07-01 实测）：**

```bash
npm install --save --legacy-peer-deps \
  react-native-reanimated@4.3.0 react-native-worklets@0.8.3
```

装这两个就够了。**不要装 reanimated 4.5+ 或 worklets 0.10+。**

## Build 命令

### Debug APK（含 Metro 调试）— 不需要 release

```bash
cd /root/medication_tracker/medication_tracker_rn/android
systemd-run --user --unit=medication-debug-build \
  --working-directory=$(pwd) \
  --setenv=ANDROID_HOME=/opt/android-sdk \
  --setenv=JAVA_HOME=/usr/lib/jvm/java-17-openjdk \
  --setenv=PATH=/opt/gradle/gradle-8.13/bin:/usr/lib/jvm/java-17-openjdk/bin:/opt/android-sdk/platform-tools:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin \
  /opt/gradle/gradle-8.13/bin/gradle :app:assembleDebug --no-daemon --max-workers=1 -x lint -PreactNativeArchitectures=arm64-v8a
```

→ `app/build/outputs/apk/debug/app-debug.apk` (~63MB)

### Release APK（独立可装，无需 Metro）

```bash
systemd-run --user --unit=medication-rel-build \
  --working-directory=$(pwd) \
  --setenv=ANDROID_HOME=/opt/android-sdk \
  --setenv=JAVA_HOME=/usr/lib/jvm/java-17-openjdk \
  --setenv=PATH=/opt/gradle/gradle-8.13/bin:/usr/lib/jvm/java-17-openjdk/bin:/opt/android-sdk/platform-tools:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin \
  /opt/gradle/gradle-8.13/bin/gradle :app:assembleRelease --no-daemon --max-workers=1 -x lint -PreactNativeArchitectures=arm64-v8a
```

→ `app/build/outputs/apk/release/app-release.apk` (~41MB)

## 关键参数说明

| 参数 | 作用 |
|---|---|
| `--no-daemon` | Gradle 8.13 `--no-daemon` 仍 fork single-use daemon，但 stop 一次性 + 不留 zombie daemon |
| `--max-workers=1` | 单 ABI 单 thread 编译，避免 OOM（4 ABI × 2 native = 8 cmake 并行会爆 15G RAM） |
| `-x lint` | 跳过 Android Lint（debug+release 都默认跑，慢且常出无关错） |
| `-PreactNativeArchitectures=arm64-v8a` | 只 build arm64 手机 ABI（节省 4× 时间） |
| `systemd-run --user --scope` | 真正 detach gradle 进程，否则 shell 退出时 gradle 也被杀 |
| `--setenv=...` | systemd-run 启的进程**不继承** env，必须显式传 ANDROID_HOME / JAVA_HOME / PATH |

## 故障排查

### "SDK location not found"
→ 缺 `--setenv=ANDROID_HOME=/opt/android-sdk`

### "Directory '/root' does not contain a Gradle build"
→ 缺 `--working-directory=/root/medication_tracker/medication_tracker_rn/android`

### "foojay-resolver-0.5.0 not found"
→ 缺 `~/.gradle/init.gradle` 配阿里 plugin 镜像

### "ndkVersion / compileSdkVersion does not exist"
→ 缺 `apply plugin: "expo-root-project"` in `android/build.gradle`

### "Bundling failed: Cannot find module 'react-native-worklets/plugin'"
→ `react-native-css-interop` 需要 worklets。装 `react-native-worklets@0.8.3`。

### "Bundling failed: react-native-reanimated not found"
→ 同上，但要 reanimated 4.3.0（不要 4.5+）。

### "Your installed version of Worklets (0.8.3) is not compatible with installed version of Reanimated (4.5.0)"
→ 配对：reanimated@4.3.0 + worklets@0.8.3。

### "libworklets.so missing and no known rule to make it"
→ worklets 0.10 NDK 27 编译失败。降 worklets 到 0.8.3。

### build 中途死
```bash
# 老 gradle daemon 占资源
gradle --stop
pkill -9 -f java
```
然后 systemd-run 重启 build。

## 限制

| 限制 | 影响 |
|---|---|
| 单 ABI（arm64-v8a only）| 你的手机必须是 arm64（2020 后所有 Android 手机都 arm64） |
| Debug keystore 签名 | 不能上 Google Play；sideload OK |
| 单 worker（max-workers=1）| build 慢 ~ 5 分钟 |
| 内存临界 8G | 跑 NDK 编译时如果系统其他进程占内存，可能 OOM |
| 磁盘临界 17G free | 装 SDK 11G + 缓存 6G，剩 0 时 build 必失败 |

## ⚠️ versionCode 必须递增

**陷阱**：`expo prebuild` 每次会重置 `android/app/build.gradle` 里的 `versionCode 1` + `versionName "0.0.1"`. v0.1→v0.4 4 个 release 都 versionCode=1, 装到手机上后, 同包名同签名同 versionCode 装新版本, Android 拒装 (MIUI/EMUI/ColorOS 报“包无效”).

**修法 1 (手动, 本项目用)**: `scripts/release.sh` 脚本会 prebuild 后 sed 改 versionCode + 打包 + 部署. 一行搞定.

```bash
./scripts/release.sh 501 0.5.1   # versionCode=501, versionName=0.5.1
```

**修法 2 (长期 P3)**: 装 `expo-build-properties` plugin, 从 `app.json.version` 派生 versionCode (自动, 不用 sed).

```json
"plugins": [["expo-build-properties", {
  "android": { "versionCode": "${calc(app.json.expo.version)}" }
}]]
```

## 网络代理 (mihomo on 127.0.0.1:7890)

本机走 mihomo 代理。`dl.google.com` / `services.gradle.org` 直连不通，但代理 OK。Gradle 不会自动读 `http_proxy` env，必须显式配。

### 方案 A: `gradle.properties` (推荐)

`android/gradle.properties` 末尾加：

```properties
systemProp.http.proxyHost=127.0.0.1
systemProp.http.proxyPort=7890
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=7890
systemProp.http.nonProxyHosts=localhost|127.0.0.1|10.*|192.168.*|*.local
android.builder.sdkDownload=false
```

`android.builder.sdkDownload=false` 防止 AGP 自动调 `dl.google.com` 拉 SDK manifest (addons_list-6.xml 超时)。SDK 已预装。

### 方案 B: `JAVA_TOOL_OPTIONS` (env, 兑底)

```bash
export JAVA_TOOL_OPTIONS="-Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=7890 -Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=7890"
```

所有 JVM 进程 (含 gradlew) 都读。

### 现象 / 诊断

| 现象 | 原因 | 修复 |
|---|---|---|
| `Network is unreachable` 跳 `dl.google.com:443` | AGP 跳过代理 | 加 `gradle.properties` proxy 或 `JAVA_TOOL_OPTIONS` |
| `gradlew` 不读 env proxy | gradlew 内部 fork 的 JVM 不读 `http_proxy` | 用 `JAVA_TOOL_OPTIONS` 或 `gradle.properties` systemProp |
| `addons_list-6.xml` 超时 | AGP 自动下 SDK manifest | `android.builder.sdkDownload=false` |
| `services.gradle.org` 超时 | Gradle wrapper 下载 | 用本地 `/opt/gradle/gradle-8.13/bin/gradle` 不下 wrapper |

### 后台跑 build（免被 shell exit 杀）

```bash
cd /root/medication_tracker/medication_tracker_rn/android
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export JAVA_TOOL_OPTIONS="-Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=7890 -Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=7890"
export PATH=/opt/gradle/gradle-8.13/bin:/usr/lib/jvm/java-17-openjdk/bin:/opt/android-sdk/platform-tools:$PATH

setsid /opt/gradle/gradle-8.13/bin/gradle :app:assembleRelease \
  --no-daemon --max-workers=1 -x lint -PreactNativeArchitectures=arm64-v8a \
  > /tmp/gradle-build.log 2>&1 < /dev/null &
disown

# poll
sleep 60 && tail -20 /tmp/gradle-build.log && wc -l /tmp/gradle-build.log
```

预期 ~5 分钟 (v0.2.0 实测 4m 50s, 526 tasks).

## 内存/磁盘的现状（2026-07-01）

```
RAM:    15G total  /  6-8G used during build  /  7-9G available
Disk:   200G  /  183G used  /  17G free
```

**Build 跑前关不必要的进程**（如别的大 JVM / docker / IDE）腾出 ≥3G。

## 跑 build 后产物

| 文件 | 大小 | 用途 |
|---|---|---|
| `app-release.apk` | ~110MB (v0.2.0+, 含 3 fonts + haptics + 14 expo modules) | sideload 到手机，独立可跑 |
| `app-debug.apk` | ~63MB | 需 Metro 同网跑 |
| `app-release-unsigned.apk` | ~110MB | 用 release key 签（未做） |

## 备注

- **不要用 `nohup setsid` 启 gradle** — 进程被 init 清理
- **必须用 `systemd-run --user --scope`** — 真 detach
- 每次 build 前用 `gradle --stop` 清理 zombie daemon
- 镜像**必须**用腾讯/阿里。直连 services.gradle.org / dl.google.com 失败率高。
- `expo prebuild --clean` 之后 `android/` 重新生成。**上述 A B C 配置在 `android/build.gradle` `android/gradle/wrapper/gradle-wrapper.properties` `~/.gradle/init.gradle` —— 后两者在 prebuild 之外。`android/build.gradle` 会被 prebuild 覆盖，需要重新应用。**
