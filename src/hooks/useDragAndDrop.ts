import { Event } from '../types';
import { changeEventDate, isValidDropTarget } from '../utils/dragDropUtils';
import { findOverlappingEvents } from '../utils/eventOverlap';

/**
 * 드래그 앤 드롭 기능을 위한 훅
 *
 * @param events - 전체 일정 목록
 * @param saveEvent - 일정 저장 함수
 * @param onOverlap - 겹침 발생 시 호출될 콜백 함수
 * @returns 드래그 앤 드롭 핸들러
 *
 * @example
 * const { handleDragStart, handleDragEnd } = useDragAndDrop(
 *   events,
 *   saveEvent,
 *   (overlaps) => setOverlappingEvents(overlaps)
 * )
 */
export function useDragAndDrop(
  events: Event[],
  saveEvent: (event: Event) => Promise<void>,
  onOverlap: (overlaps: Event[]) => void
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
   * - 반복 일정은 자동으로 단일 일정으로 변환
   * - 겹침 검사 수행
   * - 겹침이 없으면 일정 저장
   * - 겹침이 있으면 콜백 호출
   */
  const handleDragEnd = async (draggedEvent: Event, newDate: string) => {
    if (!draggedEvent || !isValidDropTarget(newDate)) return;

    // 날짜 변경 및 반복 일정 자동 단일 변환
    let updatedEvent = changeEventDate(draggedEvent, newDate);

    // 반복 일정인 경우 자동으로 단일 일정으로 변환
    if (draggedEvent.repeat.type !== 'none') {
      updatedEvent = {
        ...updatedEvent,
        repeat: { type: 'none', interval: 0 },
      };
    }

    // 겹침 검사
    const overlapping = findOverlappingEvents(updatedEvent, events);

    // 겹침이 있으면 콜백 호출 후 종료
    if (overlapping.length > 0) {
      onOverlap(overlapping);
      return;
    }

    // 일정 저장
    await saveEvent(updatedEvent);
  };

  return {
    handleDragStart,
    handleDragEnd,
  };
}
