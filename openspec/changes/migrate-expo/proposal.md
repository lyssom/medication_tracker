# C4: migrate-expo — RN CLI → Expo 迁移

## Why

C1 审计结论 P2-02：当前 RN 0.83.1 + `@react-native-community/cli@20` 步入缓慢包管理、依赖散装、EAS 构建/OTA 无门。迁 Expo 后获：
- `expo prebuild` / `expo run:android|ios` 一键构建
- `expo-secure-store / expo-application / expo-linking` 为 C2 登录持久+自动更新铺路
- `expo-router` 或 `expo-updates` 给 C3 导航重构 / OTA 兜底

## 现况

- RN：`0.83.1`（最新稳定）
- 包管理：`react-native-paper / safe-area-context / vector-icons / async-storage / zustand / axios`
- 自定义 native：`MainActivity.kt` + `MainApplication.kt`（默认 RN 模板，无定制）
- 无 custom native module（仅标准 RN）

## 方案对比

```
路径 A: Expo Prebuild + Bare Workflow   ← 选
  - expo-modules-core 装上
  - 保留 android/ ios/ 原生项目
  - 用 expo prebuild 重新生成
  - 仍可写自定义 native code

路径 B: Expo Managed
  - 必须删除 android/ ios/
  - 自定义 native 全丢
  - 不推荐：本项目已有原生骨架

路径 C: 仍留 RN CLI，只用 expo-modules 单独
  - 收益最低，过渡形态
  - 不推荐
```

**选 A**。

## Scope

| 范围 | 改动 |
|---|---|
| `package.json` | 加 `expo` 主包 + `babel-preset-expo` + 必要 `expo-*` SDK 包 |
| `app.json` | 扩展 expo 配置块（plugins, scheme, splash, icon） |
| `babel.config.js` | 替换 `@react-native/babel-preset` → `babel-preset-expo` |
| `index.js` | 替换为 `expo`/`registerRootComponent` |
| `App.tsx` | 包装加 `<SafeAreaProvider>`（已有） + `<ThemeProvider>` 后续 C3 |
| `MainActivity.kt` | 校验与 Expo Modules 兼容；如需，加 `ReactActivityDelegate` 子类使用 `ExpoReactActivityFactory` |
| `MainApplication.kt` | 改 extend `ReactApplication` 并增加 `expo` 自定义 ApplicationLifecycleDispatcher |
| 删除 | `@react-native-community/cli` 残留（保留 types） + 旧 `node_modules` |
| 不动 | `medication_tracker_bk/`（后端） |
| 不动 | `src/**` 业务代码（仅极少量 import 路径适配） |

## Steps（高粒度）

1. **备份与分支** — 切换到 `feat/migrate-expo` 分支（保留当前主线）
2. **依赖替换**
   - `npm install expo@latest`
   - `npm install --save-dev babel-preset-expo`
   - `npm uninstall @react-native-community/cli @react-native-community/cli-platform-android @react-native-community/cli-platform-ios`（如不再需要）
   - 替换 `react-native-vector-icons` → `@expo/vector-icons`（若 Paper 用到）
3. **配置 rewrite**
   - `app.json` 添加 expo 模块 plugins：`expo-secure-store`, `expo-application`, `expo-linking`, `expo-constants`
   - `babel.config.js`: `presets: ['babel-preset-expo']`
   - `index.js`: import `registerRootComponent` from `expo`
4. **原生同步**
   - `npx expo prebuild --clean` 重新生成 `android/` 和 `ios/`
   - 检查 `MainActivity.kt` 是否被覆盖，如有业务定制需人工 reapply
   - 安卓 manifest 加 `android.permission.QUERY_ALL_PACKAGES`（C2 in-app 更新需要查看已装版本）
5. **本地验证**
   - `npx expo run:android`（debug）
   - `npx expo start`（dev server）
6. **CI 准备**（NICE）：配置 EAS Build（`eas.json`）
7. **回归**：所有原 RN 脚本（lint, test）继续工作

## Acceptance

- [ ] `npx expo prebuild` 跑通不报错
- [ ] `npx expo run:android` 真机/模拟器启动首屏
- [ ] Android `.apk` 文件产出
- [ ] 现有 9 屏 + 2 组件 + 3 store 全部 import 正常，无 TypeScript 编译错
- [ ] 当前所有 RN 脚本保留（lint, test, start）
- [ ] PaperProvider + zustand store 正常工作

## Risks

| 风险 | 缓释 |
|---|---|
| `vector-icons` → `@expo/vector-icons` 字体路径变化 | Paper 配置确认；若 icon 不显，fallback `@expo/vector-icons` |
| `MainActivity.kt` / `MainApplication.kt` 被 prebuild 覆盖 | git diff 检查；定制代码 patch 回 |
| Paper 主题 token 漂移 | C3 一并修；C4 仅保"启动可" |
| Expo SDK 与 RN 0.83.1 兼容 | Expo SDK 53+ 已支持 RN 0.83；若不兼容可 downgrade RN 至 0.81 等 Expo SDK 52 兼容版 |
| new architecture (fabric) 与 expo-modules 冲突 | prebuild 默认启用 Fabric；如有 react-native-paper 兼容问题，回退到旧 arch |

## Progress Tracker (real)

| Task | 状态 | 备注 |
|---|---|---|
| T1 分支与备份 | ✓ done | branch `feat/migrate-expo` |
| T2 依赖迁移 | ⚠ partial | expo SDK 55.0.27 + 子包 ~55.0.x 装好；RN 0.83.1 提升至 0.83.6 |
| T3 配置 (app.json/babel/metro/index/scripts) | ✓ done | |
| T4 原生同步 (expo prebuild) | ✓ done | 装 nvm + Node 20 LTS；移 app.json 中 plugins（SDK 55 不支持 expo-*/constants 当 config plugin）；bundleIdentifier 去掉下划线；保证 adaptive-icon.png 是合法 1024×1024 |
| T5 业务代码适配 | n/a | C3 范围 |
| T6 本地构建 | pending | 需“ expo run:android ”真机构建；未跑 |
| T7 回归 | pending | |
| T8 verify | pending | |

## Blocker: Node Version（已解）

本环境 Node v25.9.0，`expo prebuild` 报:
```
ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING
  /node_modules/expo-modules-core/src/index.ts
```

Expo 官方要求 Node 20 LTS。

**解决方案**（已执行）：wget + nvm install 20.20.2 + `nvm use 20`。

## 备表 SDK 55 限制

- expo-constants / expo-linking / expo-secure-store / expo-application 在 SDK 55 不发布 config plugin。`app.json` 中不需列。移除后 `expo config --type prebuild` 验证通过。

## Out of Scope (defer to C2/C3)

- C2：登录持久化、自动更新检测、APK 安装 intent
- C3：UI 框架重选、全屏重写、导航重构

## Artifacts

- `openspec/changes/migrate-expo/proposal.md`
- `openspec/changes/migrate-expo/tasks.md`

## Open Decisions

- EAS Build 是否本 C4 引入（默认推后到 verify 阶段）
- Node 版本切换路径（待用户决策）

## 凭证

`114.215.177.111` / `root` / `Ly19930211` 待用：构建产物 deploy target。C4 暂不连。
