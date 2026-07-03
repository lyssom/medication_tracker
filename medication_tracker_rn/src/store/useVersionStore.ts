import { create } from 'zustand';
import * as Application from 'expo-application';
import { versionAPI, AppVersion } from '../services/api';

interface VersionState {
  latest: AppVersion | null;
  isUpdateAvailable: boolean;
  mandatory: boolean;
  dismissed: boolean;
  isLoading: boolean;
  error: string | null;
  fetchLatest: () => Promise<void>;
  dismissOnce: () => void;
  reset: () => void;
}

function compareVersions(local: string, remote: string): number {
  // Returns -1 if local<remote, 0 if equal, 1 if local>remote
  // Treat missing/invalid as 0
  const a = local.split('.').map((s) => parseInt(s, 10) || 0);
  const b = remote.split('.').map((s) => parseInt(s, 10) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

function compareBuilds(local: number | null, remote: number): number {
  const l = local ?? 0;
  if (l < remote) return -1;
  if (l > remote) return 1;
  return 0;
}

export const useVersionStore = create<VersionState>((set, get) => ({
  latest: null,
  isUpdateAvailable: false,
  mandatory: false,
  dismissed: false,
  isLoading: false,
  error: null,

  fetchLatest: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const res = await versionAPI.getLatest();
      const data = res.data?.data;
      if (!data || !data.version) {
        set({ isLoading: false });
        return;
      }

      // 比版本号 + build
      let localVersion = '0.0.0';
      try {
        localVersion = Application.nativeApplicationVersion ?? '0.0.0';
      } catch {
        localVersion = '0.0.0';
      }
      let localBuild: number | null = null;
      try {
        const b = (Application.nativeBuildVersion as string) ?? null;
        localBuild = b ? parseInt(b, 10) : null;
      } catch {
        localBuild = null;
      }

      const cmpV = compareVersions(localVersion, data.version);
      const cmpB = compareBuilds(localBuild, data.build);

      // 严格递增: 只有 local 真的 < remote 才弹.
      // 加防误报: 拿不到本地版本 (fallback 0.0.0) 或 build (null) 时,
      // 跨版本/跨 build 比较可能误报. 这种情况下不弹.
      const unknownLocal =
        localVersion === '0.0.0' || localBuild == null;
      const updateNeeded = unknownLocal
        ? false
        : cmpV < 0 || (cmpV === 0 && cmpB < 0);

      // eslint-disable-next-line no-console
      console.log(
        `[useVersionStore] local=${localVersion}(${localBuild}) remote=${data.version}(${data.build}) ` +
          `cmpV=${cmpV} cmpB=${cmpB} updateNeeded=${updateNeeded} unknownLocal=${unknownLocal}`
      );

      set({
        latest: data,
        isUpdateAvailable: updateNeeded,
        mandatory: updateNeeded ? !!data.mandatory : false,
        isLoading: false,
      });
    } catch (e: any) {
      // 404/timeout/500 -> 不弹, 不要阻塞启动
      // eslint-disable-next-line no-console
      console.warn('[useVersionStore] fetch failed:', e?.message ?? e);
      set({ isLoading: false, error: e?.message ?? 'fetch error' });
    }
  },

  dismissOnce: () => set({ dismissed: true }),
  reset: () =>
    set({
      latest: null,
      isUpdateAvailable: false,
      mandatory: false,
      dismissed: false,
      isLoading: false,
      error: null,
    }),
}));
