import { Event } from '../types';

/**
 * 일정의 날짜만 변경하고 시간은 유지합니다.
 *
 * @param event - 변경할 일정
 * @param newDate - YYYY-MM-DD 형식의 새 날짜
 * @returns 날짜만 변경된 새 일정 객체 (불변성 유지)
 *
 * @example
 * const event = { id: '1', date: '2025-10-15', startTime: '10:00', ... }
 * changeEventDate(event, '2025-10-20') // { ...event, date: '2025-10-20' }
 */
export function changeEventDate(event: Event, newDate: string): Event {
  return {
    ...event,
    date: newDate,
  };
}

/**
 * 드롭 대상이 유효한지 확인합니다.
 *
 * @param date - 검증할 날짜 문자열
 * @returns 유효한 날짜이면 true, null/undefined/빈 문자열이면 false
 *
 * @example
 * isValidDropTarget('2025-10-20') // true
 * isValidDropTarget(null)         // false
 * isValidDropTarget('')           // false
 */
export function isValidDropTarget(date: string | null | undefined): boolean {
  return !!date && date.trim().length > 0;
}
