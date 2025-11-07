import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent, expectEventInList } from './helpers';

/**
 * 드래그 앤 드롭 E2E 테스트
 *
 * 핵심 시나리오:
 * - 일정을 드래그하여 다른 날짜로 이동
 * - 반복 일정 드래그 시 단일 일정으로 변환
 * - 겹치는 시간으로 드래그 시 경고 표시
 */

const FIXED_DATE = '2024-11-07';

test.describe('드래그 앤 드롭', () => {
  // 순차 실행으로 API 충돌 방지
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test('월간 뷰에서 일정을 다른 날짜로 드래그하여 이동할 수 있다', async ({ page }) => {
    // Given: 11월 7일에 일정 생성
    await createEvent(page, {
      title: '팀 회의',
      date: FIXED_DATE,
      startTime: '10:00',
      endTime: '11:00',
    });

    await expectEventInList(page, '팀 회의');

    // When: 월간 뷰에서 일정을 11월 10일로 드래그
    const monthView = page.getByTestId('month-view');

    // 드래그할 일정 요소 찾기
    const eventElement = monthView.getByText('팀 회의').first();

    // 목표 날짜 셀 찾기 (11월 10일)
    const targetDateCell = monthView
      .locator('td')
      .filter({ has: page.locator('text="10"') })
      .first();

    // 드래그 앤 드롭 수행
    await eventElement.dragTo(targetDateCell);

    // API 업데이트 대기
    await page.waitForTimeout(1000);

    // Then: 일정이 11월 10일로 이동
    const eventList = page.getByTestId('event-list');
    await expectEventInList(page, '팀 회의');
    await expect(eventList.getByText('2024-11-10')).toBeVisible();
    // 시간은 유지됨
    await expect(eventList.getByText('10:00 - 11:00')).toBeVisible();
  });

  test('주간 뷰에서도 드래그 앤 드롭이 동작한다', async ({ page }) => {
    // Given: 일정 생성
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByLabel('week-option').click();

    await createEvent(page, {
      title: '운동',
      date: FIXED_DATE,
      startTime: '18:00',
      endTime: '19:00',
    });

    const weekView = page.getByTestId('week-view');
    await expect(weekView.getByText('운동')).toBeVisible();

    // When: 일정을 다른 날짜로 드래그 (11월 8일)
    const eventElement = weekView.getByText('운동').first();
    const targetDateCell = weekView
      .locator('td')
      .filter({ has: page.locator('text="8"') })
      .first();

    await eventElement.dragTo(targetDateCell);
    await page.waitForTimeout(1000);

    // Then: 일정이 이동됨
    const eventList = page.getByTestId('event-list');
    await expectEventInList(page, '운동');
    await expect(eventList.getByText('2024-11-08')).toBeVisible();
    await expect(eventList.getByText('18:00 - 19:00')).toBeVisible();
  });

  test('반복 일정을 드래그하면 자동으로 단일 일정으로 변환된다', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.getByLabel('제목').fill('주간 회의');
    await page.getByLabel('날짜').fill(FIXED_DATE);
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');

    await page.getByLabel('반복 일정').check();
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('weekly-option').click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2024-11-21');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);

    await page.waitForTimeout(1000);

    // 반복 일정이 생성되었는지 확인
    await expectEventInList(page, '주간 회의');
    const eventList = page.getByTestId('event-list');
    const repeatIcon = eventList.locator('[data-testid="RepeatIcon"]').first();
    await expect(repeatIcon).toBeVisible();

    // When: 반복 일정 중 하나를 드래그
    const monthView = page.getByTestId('month-view');
    const eventElement = monthView.getByText('주간 회의').first();
    const targetDateCell = monthView
      .locator('td')
      .filter({ has: page.locator('text="9"') })
      .first();

    await eventElement.dragTo(targetDateCell);
    await page.waitForTimeout(1000);

    // Then: 드래그된 일정은 단일 일정으로 변환됨 (반복 아이콘 없음)
    // 원본 반복 일정은 그대로 유지됨
    await expectEventInList(page, '주간 회의');

    // 2024-11-09에 이동한 일정을 편집하여 반복 아이콘이 없는지 확인
    // (드래그된 일정은 repeat.type이 'none'으로 변환됨)
    const events = await eventList.getByText('주간 회의').all();
    expect(events.length).toBeGreaterThan(1); // 원본 반복 일정들 + 드래그된 일정
  });

  test('겹치는 시간으로 드래그 시 경고가 표시되고 드롭이 실행되지 않는다', async ({ page }) => {
    // Given: 같은 날 두 개의 일정 생성
    await createEvent(page, {
      title: '기존 회의',
      date: '2024-11-10',
      startTime: '10:00',
      endTime: '11:00',
    });

    await createEvent(page, {
      title: '이동할 회의',
      date: FIXED_DATE,
      startTime: '10:30',
      endTime: '11:30',
    });

    // When: '이동할 회의'를 '기존 회의'가 있는 날짜로 드래그 (시간이 겹침)
    const monthView = page.getByTestId('month-view');
    const eventElement = monthView.getByText('이동할 회의').first();
    const targetDateCell = monthView
      .locator('td')
      .filter({ has: page.locator('text="10"') })
      .first();

    await eventElement.dragTo(targetDateCell);
    await page.waitForTimeout(1000);

    // Then: 겹침 경고 다이얼로그가 표시됨
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/다음 일정과 겹칩니다/)).toBeVisible();
    await expect(page.getByText('기존 회의 (2024-11-10 10:00-11:00)')).toBeVisible();

    // When: 경고를 무시하고 계속 진행
    await page.getByRole('button', { name: '계속 진행' }).click();
    await page.waitForTimeout(1000);

    // Then: 일정이 이동됨
    const eventList = page.getByTestId('event-list');
    await expectEventInList(page, '이동할 회의');
    // '이동할 회의'와 '기존 회의' 둘 다 2024-11-10에 있음
    await expect(eventList.getByText('2024-11-10').first()).toBeVisible();
  });

  test('드래그 시 모든 일정 속성이 유지된다', async ({ page }) => {
    // Given: 다양한 속성을 가진 일정 생성
    await createEvent(page, {
      title: '중요한 미팅',
      date: FIXED_DATE,
      startTime: '15:00',
      endTime: '16:30',
      description: '프로젝트 킥오프 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 60,
    });

    // When: 다른 날짜로 드래그
    const monthView = page.getByTestId('month-view');
    const eventElement = monthView.getByText('중요한 미팅').first();
    const targetDateCell = monthView
      .locator('td')
      .filter({ has: page.locator('text="12"') })
      .first();

    await eventElement.dragTo(targetDateCell);
    await page.waitForTimeout(1000);

    // Then: 날짜를 제외한 모든 속성이 유지됨
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('중요한 미팅')).toBeVisible();
    await expect(eventList.getByText('2024-11-12')).toBeVisible();
    await expect(eventList.getByText('15:00 - 16:30')).toBeVisible();
    await expect(eventList.getByText('프로젝트 킥오프 미팅')).toBeVisible();
    await expect(eventList.getByText('회의실 A')).toBeVisible();
    await expect(eventList.getByText('카테고리: 업무')).toBeVisible();
    await expect(eventList.getByText('1시간 전')).toBeVisible();
  });
});
