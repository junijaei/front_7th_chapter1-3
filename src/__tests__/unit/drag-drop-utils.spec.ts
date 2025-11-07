import { Event } from '../../types';
import { changeEventDate, isValidDropTarget } from '../../utils/dragDropUtils';

describe('changeEventDate', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 미팅',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('일정의 날짜만 변경하고 시간은 유지한다', () => {
    const result = changeEventDate(mockEvent, '2025-10-20');

    expect(result.date).toBe('2025-10-20');
    expect(result.startTime).toBe('10:00');
    expect(result.endTime).toBe('11:00');
    expect(result.title).toBe('팀 미팅');
  });

  it('원본 일정 객체를 변경하지 않는다 (불변성)', () => {
    const result = changeEventDate(mockEvent, '2025-10-20');

    expect(mockEvent.date).toBe('2025-10-15');
    expect(result.date).toBe('2025-10-20');
  });

  it('과거 날짜로 변경할 수 있다', () => {
    const result = changeEventDate(mockEvent, '2025-09-01');

    expect(result.date).toBe('2025-09-01');
  });

  it('미래 날짜로 변경할 수 있다', () => {
    const result = changeEventDate(mockEvent, '2025-12-31');

    expect(result.date).toBe('2025-12-31');
  });

  it('같은 날짜로 변경할 수 있다', () => {
    const result = changeEventDate(mockEvent, '2025-10-15');

    expect(result.date).toBe('2025-10-15');
  });
});

describe('isValidDropTarget', () => {
  it('유효한 날짜 문자열에 대해 true를 반환한다', () => {
    expect(isValidDropTarget('2025-10-20')).toBe(true);
  });

  it('null에 대해 false를 반환한다', () => {
    expect(isValidDropTarget(null)).toBe(false);
  });

  it('빈 문자열에 대해 false를 반환한다', () => {
    expect(isValidDropTarget('')).toBe(false);
  });

  it('undefined에 대해 false를 반환한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(isValidDropTarget(undefined as any)).toBe(false);
  });

  it('유효한 날짜 형식 (YYYY-MM-DD)에 대해 true를 반환한다', () => {
    expect(isValidDropTarget('2025-01-01')).toBe(true);
    expect(isValidDropTarget('2025-12-31')).toBe(true);
  });
});
