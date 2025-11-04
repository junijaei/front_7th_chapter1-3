import { RepeatType } from '../types';

/**
 * 기본 반복 설정 (반복하지 않음)
 */
export const DEFAULT_REPEAT_CONFIG = {
  type: 'none' as RepeatType,
  interval: 0,
} as const;

/**
 * endDate를 포함한 기본 반복 설정 (반복하지 않음)
 */
export const DEFAULT_REPEAT_CONFIG_WITH_END_DATE = {
  type: 'none' as RepeatType,
  interval: 0,
  endDate: '',
} as const;

/**
 * 반복하지 않는 일정의 repeat 설정 생성
 */
export const createNonRepeatingRepeat = () => ({
  type: 'none' as RepeatType,
  interval: 0,
});

/**
 * endDate를 포함한 반복하지 않는 일정의 repeat 설정 생성
 */
export const createNonRepeatingRepeatWithEndDate = () => ({
  type: 'none' as RepeatType,
  interval: 0,
  endDate: '',
});
