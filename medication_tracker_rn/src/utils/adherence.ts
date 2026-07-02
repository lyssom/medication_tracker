export interface PlanLike {
  scheduled_time: string
  scheduled_date?: string
  is_taken: boolean
}

export interface DayAdherence {
  date: string // YYYY-MM-DD
  label: string // 周一/二/...
  rate: number // 0-1
  taken: number
  total: number
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 从 plan 列表算最近 N 天 (含今日) 的依从率.
 * plan 需含 scheduled_time (HH:MM) + is_taken. 日期默认今日 (不存跨天).
 */
export function computeAdherence(plans: PlanLike[], days = 7): DayAdherence[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: DayAdherence[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = ymd(d)
    result.push({
      date: key,
      label: `周${DAY_LABELS[d.getDay()]}`,
      rate: 0,
      taken: 0,
      total: 0,
    })
  }

  // 当前实现: 把所有 plan 算到今日 (无跨天时间戳)
  const todayKey = ymd(today)
  const todayBucket = result.find((b) => b.date === todayKey)
  if (todayBucket && plans.length > 0) {
    const taken = plans.filter((p) => p.is_taken).length
    todayBucket.taken = taken
    todayBucket.total = plans.length
    todayBucket.rate = plans.length > 0 ? taken / plans.length : 0
  }

  return result
}