import { calculateEndTime, roundToNearestHour } from '../../utils/dateClickUtils';

describe('roundToNearestHour', () => {
  it('14:23을 14:00으로 반올림한다', () => {
    const date = new Date('2025-10-20T14:23:00');
    expect(roundToNearestHour(date)).toBe('14:00');
  });

  it('09:45를 10:00으로 반올림한다', () => {
    const date = new Date('2025-10-20T09:45:00');
    expect(roundToNearestHour(date)).toBe('10:00');
  });

  it('16:30을 17:00으로 반올림한다', () => {
    const date = new Date('2025-10-20T16:30:00');
    expect(roundToNearestHour(date)).toBe('17:00');
  });

  it('08:00을 08:00으로 반환한다 (정각)', () => {
    const date = new Date('2025-10-20T08:00:00');
    expect(roundToNearestHour(date)).toBe('08:00');
  });

  it('00:29를 00:00으로 반환한다', () => {
    const date = new Date('2025-10-20T00:29:00');
    expect(roundToNearestHour(date)).toBe('00:00');
  });

  it('23:30을 00:00으로 반올림한다 (익일)', () => {
    const date = new Date('2025-10-20T23:30:00');
    expect(roundToNearestHour(date)).toBe('00:00');
  });
});

describe('calculateEndTime', () => {
  it('10:00 시작 시 11:00 종료 시간 반환', () => {
    expect(calculateEndTime('10:00')).toBe('11:00');
  });

  it('14:00 시작 시 15:00 종료 시간 반환', () => {
    expect(calculateEndTime('14:00')).toBe('15:00');
  });

  it('23:00 시작 시 00:00 종료 시간 반환 (익일)', () => {
    expect(calculateEndTime('23:00')).toBe('00:00');
  });

  it('00:00 시작 시 01:00 종료 시간 반환', () => {
    expect(calculateEndTime('00:00')).toBe('01:00');
  });

  it('09:00 시작 시 10:00 종료 시간 반환', () => {
    expect(calculateEndTime('09:00')).toBe('10:00');
  });

  it('22:30 시작 시 23:30 종료 시간 반환 (분 단위 유지)', () => {
    expect(calculateEndTime('22:30')).toBe('23:30');
  });
});
