# C3: frontend-ux-overhaul — 交互/样式彻底重构

## Why

C1 审计 + 用户反馈：
- P2-02：当前 RN app 用 `useState<Page>` 手摇路由，10 个 page 在一处 if-else；导航体验差
- P2-03：baseURL LAN IP 硬编码，prod 无 env 切换
- 用户原话："前端交互流程，页面样式要彻底重构，现在交互不舒服，样式丑"

本 change 选一套现代 RN UI 框架 + 引入 react-navigation 重构全部屏。

## 框架选型

| 候选 | 体验 | 体积 | 主题 | Expo | 文档 | 状态 |
|---|---|---|---|---|---|---|
| **Tamagui** | ★★★★ | ★★★★ | ★★★★★ | 强 | ★★★★ | 活跃，v4 |
| **NativeWind v4** | ★★★ | ★★★ | ★★★★ | 强 | ★★★★ | v4 适配 RN 0.83 待确认 |
| **gluestack-ui** | ★★★ | ★★★ | ★★★ | 强 | ★★★ | v0，文档少 |
| **uni-app-x** | ★★ | ★★★★ | ★★★ | 自家 | ★★ | 跨端但非纯 RN 路线 |

**选 Tamagui。** 理由：
- 内建 theme + design token，与审计里建议的"重构 token"对齐
- 性能：编译期 CSS，bundle 比 nativewind 小
- 适配 Expo + react-native-paper 兼容层
- 在 expo-router / react-navigation 上稳定

## 导航选型

| 候选 | Expo 默认 | 文档 | 状态 |
|---|---|---|---|
| **expo-router** | ✓ | ★★★★ | v3，文件路由 |
| **react-navigation v7** | × | ★★★★★ | 老牌，插件多 |

**选 expo-router。** 理由：
- 与 C4 Expo 集成零摩擦
- 文件路由直观，未来团队上手快
- 与 Updates + Linking + URL scheme 深度集成
- 重构 9 屏 → file-based pages 自然映射

## Scope

| 模块 | 改动 |
|---|---|
| `App.tsx` | 替换 useState 路由 → `<Slot />` (expo-router) |
| 新加 `app/` 目录 | expo-router file-based routing |
| `src/screens/**` | 9 屏重写为 `app/<path>.tsx` |
| `src/components/**` | Paper 组件 → Tamagui 组件（保留部分 Paper 可用） |
| `src/theme/**` | 新加，统一 token |
| `src/store/**` | 不动（C2 已加 SecureStore + versionStore） |
| `app.json` | 加 expo-router plugin |

### 屏映射

```
src/screens/auth/LoginScreen.tsx     →  app/auth/login.tsx
src/screens/home/HomeScreen.tsx      →  app/(tabs)/index.tsx
src/screens/home/SetScreen.tsx       →  app/(tabs)/settings.tsx
src/screens/medicine/MedicineListScreen.tsx → app/(tabs)/meds.tsx
src/screens/medicine/AddMedScreen.tsx       → app/meds/add.tsx
src/screens/care/careHomeScreen.tsx  →  app/(tabs)/care.tsx
src/screens/care/careScreen.tsx      →  app/care/index.tsx
src/screens/care/careMeScreen.tsx    →  app/care/me.tsx
src/screens/care/careDetailScreen.tsx→  app/care/[userId].tsx
```

## Out of Scope

- 后端
- C4 已迁移项目
- C2 已加 SecureStore + 版本检测
- DB schema

## Acceptance

- [ ] expo-router 启动路由
- [ ] 所有 9 屏可在 file-based routes 找到
- [ ] Tamagui Provider + 主题 token 集中
- [ ] react-native-paper 解耦（除 v5 modal/dialog 保留）
- [ ] react-native-vector-icons → @expo/vector-icons
- [ ] 深链：登录后 `medicationtracker://care/123` 可直达关心详情
- [ ] 重启冷态保留 SecureStore token，不闪登录页

## Risks

| 风险 | 缓释 |
|---|---|
| Tamagui install 报错 | pin 兼容版本：tamagui ~1.120 |
| expo-router 路由冲突 | 文件唯一性检查 |
| Paper→Tamagui 行为差异 | Modal / Snackbar 保留 Paper |
| Icon 缺失 | fallback Material 文本 |

## Steps

1. 装 `tamagui @tamagui/config @tamagui/themes`，可选 `expo-router`
2. `app.json` 加 `expo-router` plugin
3. `app/_layout.tsx` 写 TamaguiProvider + Theme
4. 把 9 屏迁到 `app/`
5. 删 `src/screens/`
6. 重跑 `tsc --noEmit`
7. 编译产物对比 bundle 体积

## 凭证

- 暂用
- 真实调试需在 `114.215.177.111` 上跑模拟器
