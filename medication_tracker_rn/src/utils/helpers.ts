/**
 * 格式化时间显示
 * @param timeStr 时间字符串 (HH:MM)
 * @param format 格式类型
 */
export function formatTime(timeStr: string, format: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '';
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  if (format === '12h') {
    const period = hours >= 12 ? '下午' : '上午';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period}${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 格式化日期显示
 * @param dateStr ISO 日期字符串
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const checkinDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}

/**
 * 格式化时间显示（带日期）
 * @param dateStr ISO 日期时间字符串
 */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '下午' : '上午';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  
  return `${formatDate(dateStr)} ${period}${displayHours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 获取当前时间对应的服药组
 * @param timeStr 时间字符串 (HH:MM)
 */
export function getTimeGroup(timeStr: string): string {
  if (!timeStr) return 'unknown';
  
  const [hours] = timeStr.split(':').map(Number);
  
  if (hours >= 6 && hours < 11) return 'morning';
  if (hours >= 11 && hours < 14) return 'noon';
  if (hours >= 17 && hours < 20) return 'evening';
  if (hours >= 20 || hours < 2) return 'night';
  
  return 'other';
}

/**
 * 服药组名称映射
 */
export const TIME_GROUP_NAMES: Record<string, string> = {
  morning: '早上',
  noon: '中午',
  evening: '晚上',
  night: '睡前',
  all: '全部',
};

/**
 * 计算服药依从性颜色
 * @param rate 依从性百分比
 */
export function getComplianceColor(rate: number): string {
  if (rate >= 90) return '#10B981'; // 绿色
  if (rate >= 70) return '#F59E0B'; // 黄色
  return '#EF4444'; // 红色
}

/**
 * 补打卡原因列表
 */
export const MAKEUP_REASONS = [
  '外出忘记带药',
  '身体不适暂时停药',
  '医生建议调整用药',
  '药物用完暂时断药',
  '其他原因',
];

/**
 * 药物类型列表
 */
export const MEDICATION_CATEGORIES = [
  '处方药',
  '非处方药',
  '保健品',
  '中药',
  '其他',
];

/**
 * 药物形态列表
 */
export const MEDICATION_FORMS = [
  '片剂',
  '胶囊',
  '口服液',
  '颗粒',
  '冲剂',
  '外用药',
  '注射液',
  '其他',
];

/**
 * 服药频率列表
 */
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: '每日一次' },
  { value: 'twice_daily', label: '每日两次' },
  { value: 'three_times_daily', label: '每日三次' },
  { value: 'as_needed', label: '按需服用' },
  { value: 'weekly', label: '每周一次' },
];

/**
 * 监督关系类型
 */
export const RELATION_TYPES = [
  { value: 'family', label: '家人' },
  { value: 'friend', label: '朋友' },
  { value: 'doctor', label: '医护人员' },
  { value: 'caregiver', label: '照护者' },
];

/**
 * 库存单位列表
 */
export const UNIT_OPTIONS = [
  { value: '粒', label: '粒' },
  { value: '片', label: '片' },
  { value: '包', label: '包' },
  { value: '瓶', label: '瓶' },
  { value: '盒', label: '盒' },
  { value: '毫升', label: '毫升' },
  { value: '克', label: '克' },
];
