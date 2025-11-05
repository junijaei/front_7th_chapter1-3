import { Page, expect, APIRequestContext } from '@playwright/test';

/**
 * E2E 테스트 헬퍼 함수 모음
 * 기본 일정 관리 워크플로우 테스트에서 재사용되는 공통 함수들
 */

/**
 * 데이터베이스 초기화
 * 각 테스트 전에 e2e.json을 빈 배열로 리셋
 */
export async function resetDatabase(request: APIRequestContext) {
  const response = await request.put('http://localhost:3000/api/test/reset');

  if (!response.ok()) {
    throw new Error(`Database reset failed: ${response.statusText()}`);
  }

  return response.json();
}

/**
 * 일정 생성 헬퍼 함수
 * 폼 필드를 채우고 제출하여 일정을 생성
 */
export interface EventData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  category?: string;
}

export async function createEvent(page: Page, eventData: EventData) {
  // 제목 입력
  await page.getByLabel('제목').fill(eventData.title);

  // 날짜 입력
  await page.getByLabel('날짜').fill(eventData.date);

  // 시작 시간 입력
  await page.getByLabel('시작 시간').fill(eventData.startTime);

  // 종료 시간 입력
  await page.getByLabel('종료 시간').fill(eventData.endTime);

  // 선택적 필드
  if (eventData.description) {
    await page.getByLabel('설명').fill(eventData.description);
  }

  if (eventData.location) {
    await page.getByLabel('위치').fill(eventData.location);
  }

  if (eventData.category) {
    await page.getByLabel('카테고리').click();
    await page.getByLabel(`${eventData.category}-option`).click();
  }

  // 일정 추가 버튼 클릭 (API 응답 대기)
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/events')),
    page.getByTestId('event-submit-button').click(),
  ]);

  // 화면 업데이트를 위한 짧은 대기
  await page.waitForTimeout(500);
}

/**
 * 이벤트 리스트에 특정 제목의 일정이 표시되는지 확인
 */
export async function expectEventInList(page: Page, title: string) {
  const eventList = page.getByTestId('event-list');
  await expect(eventList.getByText(title)).toBeVisible();
}

/**
 * 이벤트 리스트에서 특정 제목의 일정을 찾아 반환
 */
export async function findEventInList(page: Page, title: string) {
  const eventList = page.getByTestId('event-list');
  return eventList.locator(`text="${title}"`).first();
}

/**
 * 주간 뷰에서 특정 날짜 셀 내에 이벤트가 있는지 확인
 */
export async function expectEventInWeekView(page: Page, title: string) {
  const weekView = page.getByTestId('week-view');
  await expect(weekView.getByText(title)).toBeVisible();
}

/**
 * 월간 뷰에서 특정 날짜 셀 내에 이벤트가 있는지 확인
 */
export async function expectEventInMonthView(page: Page, title: string) {
  const monthView = page.getByTestId('month-view');
  await expect(monthView.getByText(title)).toBeVisible();
}

/**
 * 뷰 타입 전환 (week/month)
 */
export async function switchView(page: Page, view: 'week' | 'month') {
  await page.getByLabel('뷰 타입 선택').click();
  await page.getByLabel(`${view}-option`).click();
}

/**
 * Snackbar 메시지가 표시되는지 확인
 */
export async function expectSnackbarMessage(page: Page, message: string) {
  await expect(page.getByText(message)).toBeVisible({ timeout: 5000 });
}
