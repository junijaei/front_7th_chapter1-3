import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent } from './helpers';

/**
 * 알림 시스템 E2E 테스트
 *
 * 핵심 시나리오:
 * - 알림 시간 설정
 * - 알림 표시
 */

test.describe('알림 시스템', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test('알림 시간 설정', async ({ page }) => {
    // Given & When: 10분 전 알림으로 일정 생성
    await createEvent(page, {
      title: '알림 테스트',
      date: '2024-11-07',
      startTime: '14:00',
      endTime: '15:00',
      notificationTime: 10,
    });

    // Then: 알림 시간이 표시됨
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('10분 전')).toBeVisible();
  });

  test('알림 시간 도달 시 알림 아이콘 표시', async ({ page }) => {
    // Given: 현재 시간으로부터 2분 후 시작하는 일정 생성 (1분 전 알림)
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60000);
    const endTime = new Date(startTime.getTime() + 60 * 60000);

    const formatTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const today = now.toISOString().split('T')[0];

    await page.getByLabel('제목').fill('알림 표시 테스트');
    await page.getByLabel('날짜').fill(today);
    await page.getByLabel('시작 시간').fill(formatTime(startTime));
    await page.getByLabel('종료 시간').fill(formatTime(endTime));
    await page.getByLabel('알림 설정').selectOption('1');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);
    await page.waitForTimeout(500);

    // When: 알림 시간까지 대기 (최대 65초)
    await page.waitForTimeout(65000);

    // Then: 알림 아이콘이 표시됨
    const eventItem = page
      .locator('[data-testid="event-list"] li')
      .filter({ hasText: '알림 표시 테스트' });
    const notificationIcon = eventItem.locator('[data-testid="NotificationsActiveIcon"]');
    await expect(notificationIcon).toBeVisible();
  });
});
