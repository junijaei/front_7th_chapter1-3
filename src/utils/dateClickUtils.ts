/**
 * 현재 시간을 가장 가까운 정각으로 반올림합니다.
 *
 * @param now - 반올림할 현재 시간
 * @returns HH:mm 형식의 정각 시간 (예: "14:00", "00:00")
 *
 * @example
 * roundToNearestHour(new Date('2025-10-20T14:23:00')) // "14:00"
 * roundToNearestHour(new Date('2025-10-20T09:45:00')) // "10:00"
 * roundToNearestHour(new Date('2025-10-20T23:30:00')) // "00:00" (익일)
 */
export function roundToNearestHour(now: Date): string {
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 30분 기준 반올림
  let roundedHours = minutes >= 30 ? hours + 1 : hours;

  // 24시간을 넘어가면 0시로
  if (roundedHours >= 24) {
    roundedHours = 0;
  }

  return `${String(roundedHours).padStart(2, '0')}:00`;
}

/**
 * 시작 시간에 1시간을 더한 종료 시간을 계산합니다.
 *
 * @param startTime - HH:mm 형식의 시작 시간
 * @returns HH:mm 형식의 종료 시간 (시작 시간 + 1시간)
 *
 * @example
 * calculateEndTime("10:00") // "11:00"
 * calculateEndTime("23:00") // "00:00" (익일)
 * calculateEndTime("22:30") // "23:30"
 */
export function calculateEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);

  let endHours = hours + 1;

  // 24시간을 넘어가면 0시로
  if (endHours >= 24) {
    endHours = 0;
  }

  return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
