import { test, expect } from '@playwright/test';

import { resetDatabase, expectEventInList } from './helpers';

/**
 * 반복 일정 관리 E2E 테스트
 *
 * 핵심 시나리오:
 * - 반복 일정 생성
 * - 단일 인스턴스 수정/삭제
 * - 전체 시리즈 수정/삭제
 */

const FIXED_DATE = '2024-11-07';

test.describe('반복 일정 관리', () => {
  // 순차 실행으로 API 충돌 방지
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request);
    await page.clock.install({ time: new Date('2024-11-07') });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
  });

  test('매주 반복 일정 생성', async ({ page }) => {
    // Given: 반복 일정 폼 데이터
    await page.getByLabel('제목').fill('주간 회의');
    await page.getByLabel('날짜').fill(FIXED_DATE);
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');

    // When: 반복 일정 설정 및 생성
    await page.getByLabel('반복 일정').check();
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('weekly-option').click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2024-11-28');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);

    await page.waitForTimeout(1000);

    // Then: 반복 일정이 생성되고 반복 아이콘 표시
    await expectEventInList(page, '주간 회의');
    const eventList = page.getByTestId('event-list');
    const repeatIcon = eventList.locator('[data-testid="RepeatIcon"]').first();
    await expect(repeatIcon).toBeVisible();
  });

  test('반복 일정의 단일 인스턴스 수정 및 삭제', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.getByLabel('제목').fill('팀 스탠드업');
    await page.getByLabel('날짜').fill(FIXED_DATE);
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('09:15');

    await page.getByLabel('반복 일정').check();
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('daily-option').click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2024-11-11');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);

    await page.waitForTimeout(1000);

    // When: 단일 인스턴스만 수정
    await page.getByRole('button', { name: 'Edit event' }).first().click();
    await expect(page.getByText('반복 일정 수정')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '예' }).click();

    await page.getByLabel('제목').fill('팀 스탠드업 (변경됨)');
    await page.getByTestId('event-submit-button').click();
    await page.waitForTimeout(1000);

    // Then: 해당 인스턴스만 변경됨
    await expectEventInList(page, '팀 스탠드업 (변경됨)');
    await expectEventInList(page, '팀 스탠드업');

    // When: 반복 일정의 단일 인스턴스 삭제 (변경되지 않은 반복 일정)
    const eventList = page.getByTestId('event-list');
    const deleteButtons = eventList.getByRole('button', { name: 'Delete event' });
    const firstDeleteButton = deleteButtons.first();
    await firstDeleteButton.click();

    // 반복 일정 삭제 다이얼로그가 나타남
    await expect(page.getByText('반복 일정 삭제')).toBeVisible({ timeout: 5000 });
    // "예" 선택 (이 일정만 삭제)
    await page.getByRole('button', { name: '예' }).click();
    await page.waitForTimeout(1000);

    // Then: 단일 인스턴스만 삭제되고 다른 반복 일정들은 유지됨
    // '팀 스탠드업 (변경됨)'은 그대로 있어야 함
    await expectEventInList(page, '팀 스탠드업 (변경됨)');
    // 나머지 반복 일정도 있어야 함
    await expectEventInList(page, '팀 스탠드업');
  });

  test('반복 일정의 전체 시리즈 수정 및 삭제', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.getByLabel('제목').fill('주간 리뷰');
    await page.getByLabel('날짜').fill(FIXED_DATE);
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('17:00');

    await page.getByLabel('반복 일정').check();
    await page.getByLabel('반복 유형').click();
    await page.getByLabel('weekly-option').click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2024-11-28');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/events')),
      page.getByTestId('event-submit-button').click(),
    ]);

    await page.waitForTimeout(1000);

    // When: 전체 시리즈 수정
    await page.getByRole('button', { name: 'Edit event' }).first().click();
    await expect(page.getByText('반복 일정 수정')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '아니오' }).click();

    await page.getByLabel('제목').fill('주간 회고');
    await page.getByTestId('event-submit-button').click();
    await page.waitForTimeout(1000);

    // Then: 모든 인스턴스가 변경됨
    await expectEventInList(page, '주간 회고');
    await expect(page.getByText('주간 리뷰')).not.toBeVisible();

    // When: 전체 시리즈 삭제
    await page.getByRole('button', { name: 'Delete event' }).first().click();
    await expect(page.getByText('반복 일정 삭제')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '아니오' }).click();
    await page.waitForTimeout(1000);

    // Then: 모든 인스턴스가 삭제됨
    await expect(page.getByText('주간 회고')).not.toBeVisible();
  });
});
