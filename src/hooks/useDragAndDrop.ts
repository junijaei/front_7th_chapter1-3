import { Event } from '../types';
import { changeEventDate, isValidDropTarget } from '../utils/dragDropUtils';
import { findOverlappingEvents } from '../utils/eventOverlap';

/**
 * 드래그 앤 드롭 기능을 위한 훅
 *
 * @param events - 전체 일정 목록
 * @param saveEvent - 일정 저장 함수
 * @param onOverlap - 겹침 발생 시 호출될 콜백 함수
 * @param onRecurringEvent - 반복 일정 드롭 시 호출될 콜백 함수
 * @returns 드래그 앤 드롭 핸들러
 *
 * @example
 * const { handleDragStart, handleDragEnd } = useDragAndDrop(
 *   events,
 *   saveEvent,
 *   (overlaps) => setOverlappingEvents(overlaps),
 *   (event) => showRecurringDialog(event)
 * )
 */
export function useDragAndDrop(
  events: Event[],
  saveEvent: (event: Event) => Promise<void>,
  onOverlap: (overlaps: Event[]) => void,
  onRecurringEvent: (event: Event) => void
) {
  /**
   * 드래그 시작 핸들러
   * 드래그 중인 일정 정보를 저장합니다.
   */
  const handleDragStart = () => {
    // 드래그 시작 시 필요한 로직 (현재는 DndContext에서 처리)
  };

  /**
   * 드롭 완료 핸들러
   * - 날짜만 변경하고 시간은 유지
   * - 겹침 검사 수행
   * - 반복 일정인 경우 콜백 호출
   * - 겹침이 없으면 일정 저장
   * - 겹침이 있으면 콜백 호출
   */
  const handleDragEnd = async (draggedEvent: Event, newDate: string) => {
    if (!draggedEvent || !isValidDropTarget(newDate)) return;

    // 날짜만 변경
    const updatedEvent = changeEventDate(draggedEvent, newDate);

    // 겹침 검사
    const overlapping = findOverlappingEvents(updatedEvent, events);

    // 겹침이 있으면 콜백 호출 후 종료
    if (overlapping.length > 0) {
      onOverlap(overlapping);
      return;
    }

    // 반복 일정인 경우 콜백 호출 (RecurringEventDialog 표시)
    if (draggedEvent.repeat.type !== 'none') {
      onRecurringEvent(updatedEvent);
      // 실제 저장은 다이얼로그에서 사용자 선택 후 진행
      return;
    }

    // 단일 일정은 바로 저장
    await saveEvent(updatedEvent);
  };

  return {
    handleDragStart,
    handleDragEnd,
  };
}
