import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useDateClick } from '../../hooks/useDateClick';

describe('useDateClick', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    // 각 테스트마다 시간 재설정
    vi.setSystemTime(new Date('2025-10-20T14:23:00'));
  });

  it('날짜 클릭 시 폼에 날짜가 자동 입력된다', () => {
    const setDate = vi.fn();
    const setStartTime = vi.fn();
    const setEndTime = vi.fn();
    const setEditingEvent = vi.fn();

    const { result } = renderHook(() =>
      useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
    );

    act(() => {
      result.current.handleDateCellClick('2025-10-20');
    });

    expect(setDate).toHaveBeenCalledWith('2025-10-20');
  });

  it('날짜 클릭 시 현재 시간이 정각으로 반올림되어 시작 시간에 설정된다', () => {
    const setDate = vi.fn();
    const setStartTime = vi.fn();
    const setEndTime = vi.fn();
    const setEditingEvent = vi.fn();

    const { result } = renderHook(() =>
      useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
    );

    act(() => {
      result.current.handleDateCellClick('2025-10-20');
    });

    // 14:23 → 14:00 (반올림)
    expect(setStartTime).toHaveBeenCalledWith('14:00');
  });

  it('날짜 클릭 시 종료 시간이 시작 시간 + 1시간으로 설정된다', () => {
    const setDate = vi.fn();
    const setStartTime = vi.fn();
    const setEndTime = vi.fn();
    const setEditingEvent = vi.fn();

    const { result } = renderHook(() =>
      useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
    );

    act(() => {
      result.current.handleDateCellClick('2025-10-20');
    });

    // 14:00 + 1시간 = 15:00
    expect(setEndTime).toHaveBeenCalledWith('15:00');
  });

  it('날짜 클릭 시 편집 모드가 초기화된다', () => {
    const setDate = vi.fn();
    const setStartTime = vi.fn();
    const setEndTime = vi.fn();
    const setEditingEvent = vi.fn();

    const { result } = renderHook(() =>
      useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
    );

    act(() => {
      result.current.handleDateCellClick('2025-10-20');
    });

    expect(setEditingEvent).toHaveBeenCalledWith(null);
  });

  it('09:45에 클릭 시 시작 시간이 10:00으로 반올림된다', () => {
    vi.setSystemTime(new Date('2025-10-20T09:45:00'));

    const setDate = vi.fn();
    const setStartTime = vi.fn();
    const setEndTime = vi.fn();
    const setEditingEvent = vi.fn();

    const { result } = renderHook(() =>
      useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
    );

    act(() => {
      result.current.handleDateCellClick('2025-10-20');
    });

    expect(setStartTime).toHaveBeenCalledWith('10:00');
    expect(setEndTime).toHaveBeenCalledWith('11:00');
  });

  it('23:30에 클릭 시 시작 시간이 00:00으로, 종료 시간이 01:00으로 설정된다', () => {
    vi.setSystemTime(new Date('2025-10-20T23:30:00'));

    const setDate = vi.fn();
    const setStartTime = vi.fn();
    const setEndTime = vi.fn();
    const setEditingEvent = vi.fn();

    const { result } = renderHook(() =>
      useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
    );

    act(() => {
      result.current.handleDateCellClick('2025-10-20');
    });

    expect(setStartTime).toHaveBeenCalledWith('00:00');
    expect(setEndTime).toHaveBeenCalledWith('01:00');
  });

  it('편집 모드 중 다른 날짜 클릭 시 새 일정 생성 모드로 전환된다', () => {
    const setDate = vi.fn();
    const setStartTime = vi.fn();
    const setEndTime = vi.fn();
    const setEditingEvent = vi.fn();

    const { result } = renderHook(() =>
      useDateClick(setDate, setStartTime, setEndTime, setEditingEvent)
    );

    // 다른 날짜 클릭
    act(() => {
      result.current.handleDateCellClick('2025-10-22');
    });

    expect(setEditingEvent).toHaveBeenCalledWith(null);
    expect(setDate).toHaveBeenCalledWith('2025-10-22');
  });
});
