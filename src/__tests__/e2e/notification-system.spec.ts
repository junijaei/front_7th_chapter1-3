import { test, expect } from '@playwright/test';

import { resetDatabase, createEvent, expectEventInList } from './helpers';

/**
 * E2E 테스트: 알림 시스템
 *
 * 테스트 범위:
 * - 알림 시간 설정 (1분 전, 10분 전, 1시간 전, 1일 전, 1주 전)
 * - 알림 시간 도달 시 알림 표시
 * - 이벤트 리스트에서 알림 아이콘 표시
 * - 여러 일정의 알림 동시 처리
 *
 * 제외 항목:
 * - 기본 일정 관리 (별도 파일)
 * - 반복 일정 (별도 파일)
 * - 일정 겹침 (별도 파일)
 * - 검색/필터링 (별도 파일)
 */

test.describe('알림 시스템', () => {
  test.beforeEach(async ({ page, request }) => {
    // Given: 데이터베이스 초기화
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });

    // When: 애플리케이션 페이지 로드
    await page.goto('/');

    // Then: 페이지가 정상적으로 로드됨
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test.describe('1. 알림 시간 설정', () => {
    test('1.1 1분 전 알림을 설정할 수 있어야 함', async ({ page }) => {
      // Given: 일정 입력 폼 작성
      await page.getByLabel('제목').fill('1분 전 알림 테스트');
      await page.getByLabel('날짜').fill('2024-11-07');
      await page.getByLabel('시작 시간').fill('10:00');
      await page.getByLabel('종료 시간').fill('11:00');

      // When: 알림 시간을 1분 전으로 설정
      await page.getByLabel('알림 설정').selectOption('1');

      // And: 일정 추가
      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);
      await page.waitForTimeout(500);

      // Then: 일정이 생성되고 알림 시간이 표시됨
      await expectEventInList(page, '1분 전 알림 테스트');
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('1분 전')).toBeVisible();
    });

    test('1.2 10분 전 알림을 설정할 수 있어야 함', async ({ page }) => {
      // Given & When: 10분 전 알림 설정
      await createEvent(page, {
        title: '10분 전 알림',
        date: '2024-11-07',
        startTime: '14:00',
        endTime: '15:00',
        notificationTime: 10,
      });

      // Then: 알림 시간이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('10분 전')).toBeVisible();
    });

    test('1.3 1시간 전 알림을 설정할 수 있어야 함', async ({ page }) => {
      // Given & When: 1시간 전 알림 설정
      await createEvent(page, {
        title: '1시간 전 알림',
        date: '2024-11-07',
        startTime: '16:00',
        endTime: '17:00',
        notificationTime: 60,
      });

      // Then: 알림 시간이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('1시간 전')).toBeVisible();
    });

    test('1.4 1일 전 알림을 설정할 수 있어야 함', async ({ page }) => {
      // Given & When: 1일 전 알림 설정
      await createEvent(page, {
        title: '1일 전 알림',
        date: '2024-11-07',
        startTime: '09:00',
        endTime: '10:00',
        notificationTime: 1440,
      });

      // Then: 알림 시간이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('1일 전')).toBeVisible();
    });

    test('1.5 1주 전 알림을 설정할 수 있어야 함', async ({ page }) => {
      // Given & When: 1주 전 알림 설정
      await createEvent(page, {
        title: '1주 전 알림',
        date: '2024-11-07',
        startTime: '11:00',
        endTime: '12:00',
        notificationTime: 10080,
      });

      // Then: 알림 시간이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('1주 전')).toBeVisible();
    });
  });

  test.describe('2. 알림 표시', () => {
    test('2.1 알림 시간이 되면 이벤트 리스트에 알림 아이콘이 표시되어야 함', async ({ page }) => {
      // Given: 현재 시간으로부터 1분 후 일정 생성
      const now = new Date();
      const startTime = new Date(now.getTime() + 2 * 60000); // 2분 후
      const endTime = new Date(startTime.getTime() + 60 * 60000); // 1시간 후

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
      await page.getByLabel('알림 설정').selectOption('1'); // 1분 전

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);
      await page.waitForTimeout(500);

      // When: 알림 시간이 지날 때까지 대기 (최대 65초)
      await page.waitForTimeout(65000);

      // Then: 알림 아이콘이 표시됨
      const eventItem = page.locator('[data-testid="event-list"] li').filter({
        hasText: '알림 표시 테스트',
      });
      await expect(eventItem.locator('[data-testid="notification-icon"]')).toBeVisible();
    });

    test('2.2 여러 일정의 알림이 동시에 표시될 수 있어야 함', async ({ page }) => {
      // Given: 현재 시간으로부터 2분 후 두 개의 일정 생성
      const now = new Date();
      const startTime = new Date(now.getTime() + 2 * 60000);
      const endTime = new Date(startTime.getTime() + 60 * 60000);

      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      const today = now.toISOString().split('T')[0];

      // 첫 번째 일정
      await page.getByLabel('제목').fill('회의 A');
      await page.getByLabel('날짜').fill(today);
      await page.getByLabel('시작 시간').fill(formatTime(startTime));
      await page.getByLabel('종료 시간').fill(formatTime(endTime));
      await page.getByLabel('알림 설정').selectOption('1');

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);
      await page.waitForTimeout(500);

      // 두 번째 일정
      await page.getByLabel('제목').fill('회의 B');
      await page.getByLabel('날짜').fill(today);
      await page.getByLabel('시작 시간').fill(formatTime(startTime));
      await page.getByLabel('종료 시간').fill(formatTime(endTime));
      await page.getByLabel('알림 설정').selectOption('1');

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);
      await page.waitForTimeout(500);

      // When: 알림 시간이 지날 때까지 대기
      await page.waitForTimeout(65000);

      // Then: 두 일정 모두 알림 아이콘이 표시됨
      const eventA = page.locator('[data-testid="event-list"] li').filter({ hasText: '회의 A' });
      const eventB = page.locator('[data-testid="event-list"] li').filter({ hasText: '회의 B' });

      await expect(eventA.locator('[data-testid="notification-icon"]')).toBeVisible();
      await expect(eventB.locator('[data-testid="notification-icon"]')).toBeVisible();
    });

    test('2.3 알림이 표시된 일정은 빨간색으로 강조되어야 함', async ({ page }) => {
      // Given: 현재 시간으로부터 2분 후 일정 생성
      const now = new Date();
      const startTime = new Date(now.getTime() + 2 * 60000);
      const endTime = new Date(startTime.getTime() + 60 * 60000);

      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      const today = now.toISOString().split('T')[0];

      await page.getByLabel('제목').fill('강조 테스트');
      await page.getByLabel('날짜').fill(today);
      await page.getByLabel('시작 시간').fill(formatTime(startTime));
      await page.getByLabel('종료 시간').fill(formatTime(endTime));
      await page.getByLabel('알림 설정').selectOption('1');

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/api/events')),
        page.getByTestId('event-submit-button').click(),
      ]);
      await page.waitForTimeout(500);

      // When: 알림 시간이 지날 때까지 대기
      await page.waitForTimeout(65000);

      // Then: 일정이 빨간색으로 강조됨
      const eventItem = page.locator('[data-testid="event-list"] li').filter({
        hasText: '강조 테스트',
      });

      // 빨간색 스타일이 적용되었는지 확인
      const bgColor = await eventItem.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // rgb(255, 0, 0) 또는 이와 유사한 빨간색 계열인지 확인
      expect(bgColor).toMatch(/rgb\(255,\s*\d+,\s*\d+\)/);
    });
  });

  test.describe('3. 알림 수정 및 삭제', () => {
    test('3.1 일정 수정 시 알림 시간도 변경할 수 있어야 함', async ({ page }) => {
      // Given: 10분 전 알림 일정 생성
      await createEvent(page, {
        title: '알림 수정 테스트',
        date: '2024-11-07',
        startTime: '15:00',
        endTime: '16:00',
        notificationTime: 10,
      });

      // When: 알림 시간을 1시간 전으로 수정
      await page.getByRole('button', { name: 'Edit event' }).click();
      await page.getByLabel('알림 설정').selectOption('60');
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(500);

      // Then: 수정된 알림 시간이 표시됨
      const eventList = page.getByTestId('event-list');
      await expect(eventList.getByText('1시간 전')).toBeVisible();
      await expect(eventList.getByText('10분 전')).not.toBeVisible();
    });

    test('3.2 일정 삭제 시 알림도 함께 삭제되어야 함', async ({ page }) => {
      // Given: 알림 설정된 일정 생성
      await createEvent(page, {
        title: '알림 삭제 테스트',
        date: '2024-11-07',
        startTime: '13:00',
        endTime: '14:00',
        notificationTime: 10,
      });

      // When: 일정 삭제
      await page.getByRole('button', { name: 'Delete event' }).click();
      await page.waitForTimeout(500);

      // Then: 일정과 알림이 모두 사라짐
      await expect(page.getByText('알림 삭제 테스트')).not.toBeVisible();
    });
  });

  test.describe('4. 알림 없는 일정', () => {
    test('4.1 알림을 설정하지 않은 일정은 알림 아이콘이 표시되지 않아야 함', async ({ page }) => {
      // Given: 알림 없는 일정 생성
      await createEvent(page, {
        title: '알림 없음',
        date: '2024-11-07',
        startTime: '10:00',
        endTime: '11:00',
      });

      // Then: 알림 아이콘이 표시되지 않음
      const eventItem = page.locator('[data-testid="event-list"] li').filter({
        hasText: '알림 없음',
      });
      await expect(eventItem.locator('[data-testid="notification-icon"]')).not.toBeVisible();
    });
  });
});
