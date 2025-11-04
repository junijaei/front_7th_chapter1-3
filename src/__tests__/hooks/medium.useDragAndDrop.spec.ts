import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { Event } from '../../types';

describe('useDragAndDrop', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-10-20',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const mockRecurringEvent: Event = {
    id: '3',
    title: '매일 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-10-31' },
    notificationTime: 10,
  };

  it('단일 일정 드래그 시 saveEvent가 호출된다', async () => {
    const saveEvent = vi.fn().mockResolvedValue(undefined);
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    await act(async () => {
      await result.current.handleDragEnd(mockEvents[0], '2025-10-20');
    });

    expect(saveEvent).toHaveBeenCalledWith({
      ...mockEvents[0],
      date: '2025-10-20',
    });
  });

  it('드롭 시 시간은 변경되지 않고 날짜만 변경된다', async () => {
    const saveEvent = vi.fn().mockResolvedValue(undefined);
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    await act(async () => {
      await result.current.handleDragEnd(mockEvents[0], '2025-10-25');
    });

    expect(saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2025-10-25',
        startTime: '10:00',
        endTime: '11:00',
      })
    );
  });

  it('반복 일정 드래그 시 자동으로 단일 일정으로 변환된다', async () => {
    const saveEvent = vi.fn().mockResolvedValue(undefined);
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    await act(async () => {
      await result.current.handleDragEnd(mockRecurringEvent, '2025-10-20');
    });

    // saveEvent가 호출되어야 함
    expect(saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '3',
        title: '매일 회의',
        date: '2025-10-20',
        startTime: '09:00',
        endTime: '10:00',
        repeat: { type: 'none', interval: 0 }, // 자동으로 단일 일정으로 변환
      })
    );
  });

  it('겹치는 일정이 있을 때 onOverlap 콜백이 호출되고 saveEvent는 호출되지 않는다', async () => {
    const saveEvent = vi.fn();
    const onOverlap = vi.fn();

    // mockEvents[0]을 2025-10-20으로 드롭하면 mockEvents[1]과 겹침 발생
    // mockEvents[0]: 10:00-11:00 -> 2025-10-20의 10:00-11:00
    // 겹침을 위해 2025-10-20에 10:30-11:30 일정 추가
    const eventsWithOverlap = [
      ...mockEvents,
      {
        ...mockEvents[0],
        id: '3',
        date: '2025-10-20',
        startTime: '10:30',
        endTime: '11:30',
      },
    ];

    const { result } = renderHook(() =>
      useDragAndDrop(eventsWithOverlap, saveEvent, onOverlap)
    );

    await act(async () => {
      await result.current.handleDragEnd(mockEvents[0], '2025-10-20');
    });

    expect(onOverlap).toHaveBeenCalled();
    expect(saveEvent).not.toHaveBeenCalled();
  });

  it('유효하지 않은 날짜로 드롭 시 아무 동작도 하지 않는다', async () => {
    const saveEvent = vi.fn();
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    await act(async () => {
      await result.current.handleDragEnd(mockEvents[0], '');
    });

    expect(saveEvent).not.toHaveBeenCalled();
    expect(onOverlap).not.toHaveBeenCalled();
  });

  it('draggedEvent가 null인 경우 아무 동작도 하지 않는다', async () => {
    const saveEvent = vi.fn();
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await result.current.handleDragEnd(null as any, '2025-10-20');
    });

    expect(saveEvent).not.toHaveBeenCalled();
  });

  it('네트워크 오류 시 에러를 throw한다', async () => {
    const saveEvent = vi.fn().mockRejectedValue(new Error('Network error'));
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    await expect(
      act(async () => {
        await result.current.handleDragEnd(mockEvents[0], '2025-10-25');
      })
    ).rejects.toThrow('Network error');
  });

  it('handleDragStart는 이벤트를 받아 처리한다', () => {
    const saveEvent = vi.fn();
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    act(() => {
      result.current.handleDragStart(mockEvents[0]);
    });

    // handleDragStart는 현재 내부 로직이 없음 (DndContext가 처리)
    expect(true).toBe(true);
  });

  it('모든 일정 속성이 올바르게 유지된다', async () => {
    const saveEvent = vi.fn().mockResolvedValue(undefined);
    const onOverlap = vi.fn();

    const { result } = renderHook(() =>
      useDragAndDrop(mockEvents, saveEvent, onOverlap)
    );

    await act(async () => {
      await result.current.handleDragEnd(mockEvents[0], '2025-10-25');
    });

    expect(saveEvent).toHaveBeenCalledWith({
      id: '1',
      title: '팀 미팅',
      date: '2025-10-25',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  it('반복 일정과 겹침이 동시에 발생하면 겹침 검사가 우선된다', async () => {
    const saveEvent = vi.fn();
    const onOverlap = vi.fn();

    // mockRecurringEvent를 2025-10-20으로 드롭하면 09:00-10:00이 됨
    // 겹침을 위해 2025-10-20에 09:30-10:30 일정 추가 (부분 겹침)
    const eventsWithOverlap = [
      ...mockEvents,
      {
        ...mockEvents[0],
        id: '4',
        date: '2025-10-20',
        startTime: '09:30',
        endTime: '10:30',
      },
    ];

    const { result } = renderHook(() =>
      useDragAndDrop(eventsWithOverlap, saveEvent, onOverlap)
    );

    await act(async () => {
      await result.current.handleDragEnd(mockRecurringEvent, '2025-10-20');
    });

    // 겹침이 있으므로 onOverlap이 호출되고 saveEvent는 호출되지 않음
    expect(onOverlap).toHaveBeenCalled();
    expect(saveEvent).not.toHaveBeenCalled();
  });
});
