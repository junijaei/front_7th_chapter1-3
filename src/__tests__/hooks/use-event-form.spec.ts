import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event } from '../../types.ts';

const mockNonRepeatingEvent: Event = {
  id: '1',
  title: '팀 회의',
  date: '2025-10-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 팀 회의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const mockRepeatingEvent: Event = {
  id: '2',
  title: '주간 회의',
  date: '2025-10-01',
  startTime: '14:00',
  endTime: '15:00',
  description: '주간 팀 회의',
  location: '회의실',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
  },
  notificationTime: 10,
};

const createChangeEvent = (value: string): ChangeEvent<HTMLInputElement> =>
  ({
    target: { value },
  }) as ChangeEvent<HTMLInputElement>;

describe('초기 상태', () => {
  it('initialEvent가 없으면 모든 필드가 기본값으로 설정되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('');
    expect(result.current.notificationTime).toBe(10);
    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
    expect(result.current.editingEvent).toBeNull();
  });

  it('initialEvent가 있으면 해당 값으로 초기화되어야 한다', () => {
    const { result } = renderHook(() => useEventForm(mockNonRepeatingEvent));

    expect(result.current.title).toBe('팀 회의');
    expect(result.current.date).toBe('2025-10-01');
    expect(result.current.startTime).toBe('10:00');
    expect(result.current.endTime).toBe('11:00');
    expect(result.current.description).toBe('주간 팀 회의');
    expect(result.current.location).toBe('회의실 A');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.notificationTime).toBe(10);
  });

  it('initialEvent가 반복 일정이면 isRepeating이 true여야 한다', () => {
    const { result } = renderHook(() => useEventForm(mockRepeatingEvent));

    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('weekly');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('2025-12-31');
  });
});

describe('상태 변경 함수', () => {
  it('setTitle을 호출하면 title이 변경되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setTitle('새 제목');
    });

    expect(result.current.title).toBe('새 제목');
  });

  it('setDate를 호출하면 date가 변경되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setDate('2025-10-15');
    });

    expect(result.current.date).toBe('2025-10-15');
  });

  it('setCategory를 호출하면 category가 변경되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setCategory('개인');
    });

    expect(result.current.category).toBe('개인');
  });
});

describe('handleStartTimeChange', () => {
  it('시작 시간을 변경하면 startTime이 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleStartTimeChange(createChangeEvent('09:00'));
    });

    expect(result.current.startTime).toBe('09:00');
  });

  it('시작 시간이 종료 시간보다 늦으면 에러 메시지가 설정되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleEndTimeChange(createChangeEvent('10:00'));
    });

    act(() => {
      result.current.handleStartTimeChange(createChangeEvent('11:00'));
    });

    expect(result.current.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.current.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('시작 시간이 종료 시간보다 빠르면 에러가 해제되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // 에러 상태 만들기
    act(() => {
      result.current.handleEndTimeChange(createChangeEvent('10:00'));
    });

    act(() => {
      result.current.handleStartTimeChange(createChangeEvent('11:00'));
    });

    // 에러 해제
    act(() => {
      result.current.handleStartTimeChange(createChangeEvent('09:00'));
    });

    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
  });
});

describe('handleEndTimeChange', () => {
  it('종료 시간을 변경하면 endTime이 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleEndTimeChange(createChangeEvent('18:00'));
    });

    expect(result.current.endTime).toBe('18:00');
  });

  it('종료 시간이 시작 시간보다 빠르면 에러 메시지가 설정되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleStartTimeChange(createChangeEvent('10:00'));
    });

    act(() => {
      result.current.handleEndTimeChange(createChangeEvent('09:00'));
    });

    expect(result.current.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.current.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('종료 시간이 시작 시간보다 늦으면 에러가 해제되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // 에러 상태 만들기
    act(() => {
      result.current.handleStartTimeChange(createChangeEvent('10:00'));
    });

    act(() => {
      result.current.handleEndTimeChange(createChangeEvent('09:00'));
    });

    // 에러 해제
    act(() => {
      result.current.handleEndTimeChange(createChangeEvent('11:00'));
    });

    expect(result.current.startTimeError).toBeNull();
    expect(result.current.endTimeError).toBeNull();
  });
});

describe('resetForm', () => {
  it('모든 필드를 기본값으로 초기화해야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    // 모든 필드에 값 설정
    act(() => {
      result.current.setTitle('제목');
      result.current.setDate('2025-10-01');
      result.current.setStartTime('10:00');
      result.current.setEndTime('11:00');
      result.current.setDescription('설명');
      result.current.setLocation('위치');
      result.current.setCategory('개인');
      result.current.setIsRepeating(true);
      result.current.setRepeatType('daily');
      result.current.setRepeatInterval(2);
      result.current.setRepeatEndDate('2025-12-31');
      result.current.setNotificationTime(30);
    });

    // resetForm 호출
    act(() => {
      result.current.resetForm();
    });

    // 모든 필드가 기본값으로 초기화되었는지 확인
    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.endTime).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.location).toBe('');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('');
    expect(result.current.notificationTime).toBe(10);
  });
});

describe('editEvent', () => {
  it('일반 이벤트를 편집하면 모든 필드가 해당 이벤트 값으로 설정되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(mockNonRepeatingEvent);
    });

    expect(result.current.title).toBe('팀 회의');
    expect(result.current.date).toBe('2025-10-01');
    expect(result.current.startTime).toBe('10:00');
    expect(result.current.endTime).toBe('11:00');
    expect(result.current.description).toBe('주간 팀 회의');
    expect(result.current.location).toBe('회의실 A');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.notificationTime).toBe(10);
    expect(result.current.editingEvent).toEqual(mockNonRepeatingEvent);
  });

  it('반복 일정을 편집하면 반복 관련 필드도 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(mockRepeatingEvent);
    });

    expect(result.current.title).toBe('주간 회의');
    expect(result.current.date).toBe('2025-10-01');
    expect(result.current.startTime).toBe('14:00');
    expect(result.current.endTime).toBe('15:00');
    expect(result.current.description).toBe('주간 팀 회의');
    expect(result.current.location).toBe('회의실');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('weekly');
    expect(result.current.repeatInterval).toBe(1);
    expect(result.current.repeatEndDate).toBe('2025-12-31');
    expect(result.current.notificationTime).toBe(10);
    expect(result.current.editingEvent).toEqual(mockRepeatingEvent);
  });
});
