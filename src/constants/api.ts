/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 단일 이벤트 조회
  EVENTS: '/api/events',

  // 특정 이벤트 조작 (ID 기반)
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,

  // 반복 이벤트 조작 (repeatId 기반)
  RECURRING_EVENT_BY_ID: (repeatId: string) => `/api/recurring-events/${repeatId}`,

  // 일괄 이벤트 조작
  EVENTS_LIST: '/api/events-list',
} as const;
