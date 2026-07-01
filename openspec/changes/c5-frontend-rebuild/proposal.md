# C5: frontend-rebuild (NativeWind) — 二次重写

## Why

C3 选了 Tamagui 2.x，结果 expo-router 56 + RN 0.85 + React 19 组合下崩了：
- `<>...</>` Fragment 在 `mapProtectedScreen.js:66` 被 `\`${child}\`` 字符串化时撞 Symbol
- Tamagui 2 的 native module 引 `react-dom`，新架构下要 react-dom 验证装包 — 不稳
- 实际功能崩在手机上，Metro log 看不到

现在 Mobile 上还是 react-native-paper（Material 风），不丑但不算现代。决定再选：

| 候选 | 评估 |
|---|---|
| Tamagui 1.x | 官方转向 v2；逆版本走 |
| Tamagui 2.x | 已证实不稳，不重蹈 |
| NativeWind v4 | ✅ Tailwind 类名、编译期 CSS、Expo 官方路线、不依赖 react-dom、文档好 |
| gluestack-ui | v0 状态，文档少 |

**选 NativeWind v4。**

## Scope

替换所有屏的 UI 实现：
- 删 `src/theme/tamagui.config.ts`（如还在）
- 装：`nativewind@4` + `tailwindcss@^3.4` + `react-native-reanimated` + `react-native-worklets`
- 配 `babel.config.js`：`['babel-preset-expo', { jsxImportSource: 'nativewind' }]` + `'nativewind/babel'`
- 配 `tailwind.config.js`：content paths + colors token
- 删 `react-native-paper` import，改 `className="..."`
- 9 屏全部 NativeWind 重写
- 统一 `SafeAreaProvider` + 移除 `PaperProvider`

## 不动

- `expo-router` 路由层
- store 状态（useAuth / useVersion / useMed）
- API 服务层
- backend

## Acceptance

- [ ] Bundle 200 OK · 0 业务 error
- [ ] NativeWind className 跑通（手机可见布局与设计一致）
- [ ] 9 屏：login / index / meds / care / settings / meds/add / care/index / care/me / care/[userId]
- [ ] Tamagui / Paper 不再 import

## Risks

| 风险 | 缓释 |
|---|---|
| Tailwind className vs RN 内的 `style` prop 冲突 | 优先 className，避免混用 |
| NativeWind 4 在 RN 0.85 兼容性 | Expo 56 official support 没问题 |
| reanimated/worklets 给 bundle 加大 | 实际只几 MB，可接受 |

## Out of Scope

- 路由结构（保持 expo-router）
- 状态管理（保持 zustand）
- backend
- 完整设计 token 完整化（用 Tailwind 默认主题 + 几 个 brand color）