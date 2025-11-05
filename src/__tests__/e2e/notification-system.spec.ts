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
  // 순차 실행으로 API 충돌 방지
  test.describe.configure({ mode: 'serial' });

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
    // Given: 10분 전 알림으로 일정 생성 (14:00 시작)
    await createEvent(page, {
      title: '회의',
      date: '2024-11-07',
      startTime: '14:00',
      endTime: '15:00',
      notificationTime: 10,
    });

    // When: 알림 시간(13:50)으로 시간 진행
    await page.clock.setSystemTime(new Date('2024-11-07T13:50:00'));
    // setInterval이 실행되도록 시간을 진행
    await page.clock.runFor(2000);

    // Then: 알림이 표시됨 (타이틀이 빨간색 bold로 변경)
    const eventList = page.getByTestId('event-list');
    const eventTitle = eventList.getByText('회의');

    // 타이틀이 빨간색(error)으로 표시되는지 확인
    const color = await eventTitle.evaluate((el) => window.getComputedStyle(el).color);
    // MUI의 error 색상은 rgb(211, 47, 47) 또는 유사한 빨간색
    expect(color).toMatch(/rgb\(2\d{2}, 4[0-9], 4[0-9]\)/);
  });
});
