# C2: session-and-update — 登录持久化 + 自动检测更新

## Why

用户反馈两个原 bug 亟待解决：
1. **杀进程 → 再开 → 重登** —— `useAuthStore` 用 `zustand/middleware` 的 `persist`，AsyncStorage 已装；但重启后 token 是否真的 persist 未验证，且 `userStore`（重复 dead-code）+ `useAuthStore` 双轨制可能冲突。
2. **app 内下载更新** —— 后端目前没有版本/构建包元数据端点，app 内无更新检测。

本 change 合并两个特性，共享 app 启动时机，复用 SecureStore 基础设施。

## Scope

### 后端 (`medication_tracker_bk/`)
- 新加 1 个 blueprint：`routes/version.py`
- 1 个端点：`GET /api/version/latest`
- 1 个数据源：`uploads/` 目录下维护 `latest.json`（手工写或脚本生成）
- 0 个新表

### 前端 (`medication_tracker_rn/`)
- `src/services/api.ts` 加 `versionAPI.getLatest()`
- `src/store/useAuthStore.ts` 用 `expo-secure-store` 替换 AsyncStorage
- `src/store/useVersionStore.ts` 新加（fetch latest，触发弹窗）
- `App.tsx` 启动时：① 测 token 有效性 ② fetch version ③ 触发更新提示
- 新组件 `src/components/UpdateModal.tsx`（强制+可选模式）

### 不动
- backend 业务路由
- RN 业务屏
- DB schema

## API 契约

```
GET /api/version/latest
→ 200 {
    "version": "0.1.2",
    "build": 102,
    "released_at": "2026-07-01T08:00:00Z",
    "mandatory": false,
    "download_url": "http://114.215.177.111:5000/downloads/medication_tracker_rn_v0.1.2.apk",
    "notes": "修复今日服药提醒；新增关心页面"
  }
```

## 前端 lifecycle

```
App 启动
  ├─ SecureStore.getItem('accessToken')
  │   ├─ 无 → LoginScreen（首次登录流）
  │   ├─ 有 → 试 /auth/me（探活）
  │       ├─ 200 → 用缓存 user 进入主页
  │       └─ 401 → 清缓存 → LoginScreen
  │
  └─ versionStore.fetchLatest()
      ├─ fetch /api/version/latest
      ├─ 对比本地 Application.nativeApplicationVersion + Application.nativeBuildVersion
      │   ├─ server > local + !mandatory → 弹可选更新
      │   ├─ server > local + mandatory → 弹强制更新（无取消）
      │   └─ server <= local → 不弹
      └─ 若可更新 → 弹 UpdateModal
          ├─ 用户点更新 → Linking.openURL(download_url)
          └─ 用户取消（仅非强制）→ 不弹
```

## Failure Modes

| 情况 | 处理 |
|---|---|
| SecureStore 不可用（罕见 Android 硬件 keystore 失败） | 退回 AsyncStorage；warn 一行 |
| /api/version/latest 404 | 静默不弹更新（旧服务端版本） |
| /api/version/latest 500/timeout | 静默不弹更新；不阻止登录 |
| 下载链接 404 | Linking.openURL 浏览器提示失败 |
| 版本号格式不兼容 (semver 解析失败) | 视为本地=server，不弹 |

## Steps

1. 后端
   - [ ] 加 `routes/version.py`，含 `latest.json` 读取路径
   - [ ] 注册 blueprint 到 `app.py`
   - [ ] 写 `uploads/latest.json` 占位
   - [ ] curl 验证端点

2. 前端
   - [ ] `api.ts` 加 `versionAPI.getLatest()`
   - [ ] `useAuthStore.ts`：persist 用 SecureStore adapter
   - [ ] `useVersionStore.ts`：state 含 `latest / localVersion / modalOpen`
   - [ ] `UpdateModal.tsx` 组件
   - [ ] `App.tsx` 启动 hook

3. 联调
   - [ ] mock 后端 latest.json 含新 version，验证弹窗
   - [ ] 杀进程 cold restart，验证不重登（SecureStore 实际持久）

## Acceptance

- [ ] App 重启无需重新登录（除非 token 401）
- [ ] 后端 latest.json 含 version > local → 启动弹 UpdateModal
- [ ] mandatory=true → 弹窗无取消按钮
- [ ] mandatory=false → 弹窗可关，跳过本次更新
- [ ] 下载 → Linking 唤起浏览器或触发 APK 安装
- [ ] 服务端 404/500 不影响登录

## Risks

| 风险 | 缓释 |
|---|---|
| SecureStore 在旧 Android 不可读 | 退回 AsyncStorage；不致命 |
| Linking 唤起失败 | toast 提示复制链接 |
| 用户拒绝存储权限 | 提示一次再降级到无持久 |
| Mandatory 版本一直不更新 | 加远端 flag 强制最终 pop-out |

## Out of Scope (defer to C3)

- UI 框架重选（弹窗依然用 Paper）
- 多 app variant（iOS / Web 独立版本）
- 自动安装 APK（Intent.ACTION_INSTALL_PACKAGE）

## 凭证

`114.215.177.111` / `root` / `Ly19930211` — 部署 `uploads/` + `latest.json` 时用。本 change 实施期间不连，只在最终部署步骤连。
