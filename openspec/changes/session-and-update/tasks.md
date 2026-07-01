# C2: session-and-update Tasks

> Phase 3 build checklist

## Backend

### T1. version 蓝图
- [ ] 新建 `medication_tracker_bk/routes/version.py`
- [ ] 定义 `GET /api/version/latest` 路由
- [ ] 读 `uploads/latest.json`，找不到返回 fallback 默认值
- [ ] 在 `app.py` 注册 blueprint

### T2. latest.json fixture
- [ ] 在 `medication_tracker_bk/uploads/latest.json` 写示例 JSON
- [ ] `.gitignore` 已排除 uploads/（验证）
- [ ] 加 `.gitkeep` 让目录被纳入版本控制

### T3. curl 验证
- [ ] `curl http://localhost:5000/api/version/latest` 返回 200
- [ ] 内容含 `version / build / mandatory / download_url`

## Frontend

### T4. versionAPI
- [ ] 在 `medication_tracker_rn/src/services/api.ts` 加 `versionAPI.getLatest()`
- [ ] TypeScript 类型 `AppVersion = { version, build, ... }`

### T5. useAuthStore — SecureStore adapter
- [ ] 装 `expo-secure-store`（已装）
- [ ] 实现 `secureStoreStorage` adapter（基于 zustand persist Storage interface）
- [ ] 替换 `useAuthStore.persist` 的 `name: 'auth-storage'` 用 SecureStore
- [ ] 加 `hydrate()` 显式触发（避免启动时序问题）
- [ ] AsyncStorage 依赖移除（备用）

### T6. useVersionStore
- [ ] 新建 `medication_tracker_rn/src/store/useVersionStore.ts`
- [ ] state: `{ latest: AppVersion | null, isUpdateAvailable, mandatory, dismissed, isLoading }`
- [ ] actions: `fetchLatest(localVersion: string)`, `dismissOnce()`

### T7. UpdateModal 组件
- [ ] 新建 `medication_tracker_rn/src/components/UpdateModal.tsx`
- [ ] props: `visible, mandatory, version, notes, downloadUrl, onDismiss`
- [ ] mandatory=true 时按钮 disabled + 单一"立即更新"
- [ ] 调用 `Linking.openURL(downloadUrl)`

### T8. App.tsx 启动 hook
- [ ] 引入 `useAuthStore.hydrate` + `useVersionStore.fetchLatest`
- [ ] 启动序列：hydrate → fetch(latest) → 决定是否显示 UpdateModal
- [ ] 新加 `<UpdateModal />` 放最后
- [ ] 服务端 404/500 不抛错（catch all）

### T9. TypeScript verify
- [ ] `tsc --noEmit` 通过
- [ ] 所有 import 不报 missing

## Integration

### T10. 联调
- [ ] 模拟 latest.json version bump → 重启 app 必弹 modal
- [ ] token kill + 重启 → 不重新登录
- [ ] 401 fallthrough → 跳 LoginScreen

## Out of Scope (defer)

- C3 弹窗样式改写（仍用 Paper Modal）
- 自动 APK install Intent（C5+）
- iOS TestFlight / App Store 检测
