import { Event } from '../types';
import { calculateEndTime, roundToNearestHour } from '../utils/dateClickUtils';

/**
 * 날짜 클릭으로 일정 생성 폼을 자동으로 채우는 훅
 *
 * @param setDate - 날짜 설정 함수
 * @param setStartTime - 시작 시간 설정 함수
 * @param setEndTime - 종료 시간 설정 함수
 * @param setEditingEvent - 편집 중인 일정 설정 함수
 * @returns 날짜 셀 클릭 핸들러를 포함한 객체
 *
 * @example
 * const { handleDateCellClick } = useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
 * handleDateCellClick('2025-10-20') // 폼에 날짜와 현재 시간 자동 입력
 */
export function useDateClick(
  setDate: (date: string) => void,
  setStartTime: (time: string) => void,
  setEndTime: (time: string) => void,
  setEditingEvent: (event: Event | null) => void
) {
  /**
   * 날짜 셀 클릭 시 폼을 자동으로 채웁니다.
   * - 편집 모드를 초기화 (새 일정 생성 모드)
   * - 클릭한 날짜를 폼에 설정
   * - 현재 시간을 정각으로 반올림하여 시작 시간 설정
   * - 시작 시간 + 1시간을 종료 시간으로 설정
   */
  const handleDateCellClick = (date: string) => {
    // 편집 모드 초기화
    setEditingEvent(null);

    // 날짜 설정
    setDate(date);

    // 현재 시간을 정각으로 반올림
    const now = new Date();
    const startTime = roundToNearestHour(now);
    setStartTime(startTime);

    // 종료 시간 = 시작 시간 + 1시간
    const endTime = calculateEndTime(startTime);
    setEndTime(endTime);
  };

  return {
    handleDateCellClick,
  };
}
